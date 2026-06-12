import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';
import { gsap } from 'gsap';
import { DioramaStage } from './DioramaStage.js';
import { QualityManager } from './QualityManager.js';
import { CameraRig } from './CameraRig.js';
import { setOutlinesEnabled } from './toon.js';
import { glState } from '../scroll/state.js';
import { clamp, damp } from '../utils/math.js';
import { isTouchPrimary } from '../utils/env.js';

let experience = null;

class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.quality = new QualityManager();
    setOutlinesEnabled(this.quality.tier.outlines);

    this.renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true, // low-poly toon edges need it; the scene is cheap enough
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(50, 1, 0.1, 60);
    this.rig = new CameraRig(this.camera);

    // Toon lighting: one key light for the cel bands, a warm hemisphere fill.
    const key = new DirectionalLight(0xfff6e8, 2.2);
    key.position.set(3.5, 5, 4);
    const fill = new HemisphereLight(0xfdf6ff, 0xd8b58a, 1.0);
    this.scene.add(key, fill);

    this.stage = new DioramaStage();
    this.scene.add(this.stage.group);

    this.quality.onDemote = () => this._applySize();

    this._time = 0;
    this._lean = 0;
    this._contextLosses = 0;

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
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // Sets sit in the empty stage column on wide screens, centred-and-raised
    // above the copy on small ones (mirrors the CSS grid breakpoint).
    this.stage.setLayout(w > 1180 ? 2.7 : 2.2, w <= 880);
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
  }

  _tick(_time, deltaMS) {
    const dt = clamp(deltaMS / 1000, 0.0005, 0.05);
    this._time += dt;
    this.quality.tick(dt);

    const cp = clamp(glState.chapterProgress, 0, 8);
    this.stage.setProgress(cp);
    this.stage.update(this._time);

    // Fast scrolling gives the whole stage a little cartoon lean, like wind.
    const targetLean = clamp(glState.scrollVelocity, -0.6, 0.6) * -0.06;
    this._lean = damp(this._lean, targetLean, 3, dt);
    this.stage.group.rotation.z = this._lean;

    this.rig.update(cp, dt);
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
    this.stage.dispose();
    this.renderer.dispose();
    experience = null;
  }
}

export function startExperience(canvas) {
  if (!experience && canvas) experience = new Experience(canvas);
  return experience;
}
