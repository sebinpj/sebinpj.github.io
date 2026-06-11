import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { gsap } from 'gsap';
import { ParticleSystem } from './ParticleSystem.js';
import { QualityManager } from './QualityManager.js';
import { CameraRig } from './CameraRig.js';
import { glState } from '../scroll/state.js';
import { oklchToSRGB } from '../utils/color.js';
import { clamp } from '../utils/math.js';
import { isTouchPrimary } from '../utils/env.js';

let experience = null;

class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.quality = new QualityManager();

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(50, 1, 0.1, 60);
    this.rig = new CameraRig(this.camera);

    this.particles = new ParticleSystem({
      textureSize: this.quality.tier.textureSize,
      pixelRatio: this.quality.pixelRatio(),
      pointSize: this.quality.tier.pointSize,
      opacity: this.quality.tier.opacity,
    });
    this.scene.add(this.particles.points);

    this.quality.onDemote = () => this._applySize();

    this._time = 0;
    this._contextLosses = 0;
    this._pointerWorld = new Vector3(999, 999, 999);
    this._pointerForce = 0;
    this._pointerTargetForce = 0;

    this._onResize = this._onResize.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._tick = this._tick.bind(this);

    this._lastViewport = { w: innerWidth, h: innerHeight };
    addEventListener('resize', this._onResize);
    if (!isTouchPrimary()) {
      addEventListener('pointermove', this._onPointerMove, { passive: true });
    }

    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this._contextLosses += 1;
      if (this._contextLosses > 1) this.destroy();
    });
    canvas.addEventListener('webglcontextrestored', () => this._applySize());

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) gsap.ticker.remove(this._tick);
      else if (!this._destroyed) gsap.ticker.add(this._tick);
    });

    this._applySize();
    gsap.ticker.add(this._tick);
    if (import.meta.env.DEV) window.__EXP = this;
  }

  _applySize() {
    const w = innerWidth;
    const h = innerHeight;
    this.renderer.setPixelRatio(this.quality.pixelRatio());
    this.renderer.setSize(w, h);
    this.particles.setPixelRatio(this.quality.pixelRatio());
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // Keep the form clear of the text column on wide screens
    // (scaled per-chapter by the rig's xFactor in the tick).
    this._baseX = w > 980 ? 2.4 : 0;
    this.scene.position.y = w > 980 ? 0 : 0.6;
  }

  _onResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      const dw = Math.abs(innerWidth - this._lastViewport.w);
      const dh = Math.abs(innerHeight - this._lastViewport.h);
      // Ignore mobile address-bar churn (height-only wobble).
      if (dw < 1 && dh < 150) return;
      this._lastViewport = { w: innerWidth, h: innerHeight };
      this._applySize();
    }, 200);
  }

  _onPointerMove(e) {
    const nx = (e.clientX / innerWidth) * 2 - 1;
    const ny = -((e.clientY / innerHeight) * 2 - 1);
    this.rig.setPointer(nx, ny);

    // Project the cursor onto the z≈0 plane of the particle field so the
    // repulsion happens where the cursor visually is.
    const origin = this.camera.position.clone();
    const dir = new Vector3(nx, ny, 0.5).unproject(this.camera).sub(origin).normalize();
    const t = -origin.z / (dir.z || 1e-6);
    if (t > 0) {
      this._pointerWorld.copy(origin).addScaledVector(dir, t).sub(this.scene.position);
    }
  }

  _tick(_time, deltaMS) {
    const dt = clamp(deltaMS / 1000, 0.0005, 0.05);
    this._time += dt;
    this.quality.tick(dt);

    const cp = clamp(glState.chapterProgress, 0, 8);
    this.particles.setProgress(cp);

    // Repulsion only earns its keep in the project-network chapters.
    this._pointerTargetForce = cp > 5.5 ? 0.55 : 0;
    this._pointerForce += (this._pointerTargetForce - this._pointerForce) * Math.min(1, dt * 4);

    const velocityKick = clamp(Math.abs(glState.scrollVelocity), 0, 0.5) * 0.35;
    this.particles.update(this._time, {
      turbulence: 0.12 + velocityKick,
      accentRGB: oklchToSRGB(0.8, 0.14, glState.accentH),
      pointerWorld: this._pointerWorld,
      pointerForce: this._pointerForce,
    });

    this.rig.update(cp, dt);
    this.scene.position.x = this._baseX * this.rig.xFactor;
    this.renderer.render(this.scene, this.camera);

    if (!this._live) {
      this._live = true;
      this.canvas.classList.add('is-live');
    }
  }

  destroy() {
    this._destroyed = true;
    gsap.ticker.remove(this._tick);
    removeEventListener('resize', this._onResize);
    removeEventListener('pointermove', this._onPointerMove);
    this.canvas.classList.remove('is-live');
    this.particles.dispose();
    this.renderer.dispose();
    experience = null;
  }
}

export function startExperience(canvas) {
  if (!experience && canvas) experience = new Experience(canvas);
  return experience;
}
