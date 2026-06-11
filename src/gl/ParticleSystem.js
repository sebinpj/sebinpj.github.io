import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  NearestFilter,
  Points,
  RGBAFormat,
  ShaderMaterial,
  Vector3,
} from 'three';
import { generateShapeTexels } from './shapes/index.js';
import { seededRandom } from '../utils/math.js';
import vertexShader from './shaders/particles.vert.glsl';
import fragmentShader from './shaders/particles.frag.glsl';

export class ParticleSystem {
  constructor({ textureSize, pixelRatio, pointSize, opacity }) {
    const side = textureSize;
    const count = side * side;

    this.textures = generateShapeTexels(count).map((data) => {
      const tex = new DataTexture(data, side, side, RGBAFormat, FloatType);
      tex.minFilter = NearestFilter;
      tex.magFilter = NearestFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      return tex;
    });

    const refs = new Float32Array(count * 2);
    const rands = new Float32Array(count * 4);
    const rand = seededRandom(42);
    for (let i = 0; i < count; i++) {
      refs[i * 2 + 0] = ((i % side) + 0.5) / side;
      refs[i * 2 + 1] = (Math.floor(i / side) + 0.5) / side;
      rands[i * 4 + 0] = rand();
      rands[i * 4 + 1] = rand();
      rands[i * 4 + 2] = rand();
      rands[i * 4 + 3] = rand();
    }

    const geometry = new BufferGeometry();
    // Points needs a position attribute to compute draw range; give it a
    // zero-stride stand-in — actual positions come from the data textures.
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute('aRef', new BufferAttribute(refs, 2));
    geometry.setAttribute('aRand', new BufferAttribute(rands, 4));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      uniforms: {
        uTexA: { value: this.textures[0] },
        uTexB: { value: this.textures[1] },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uTurbulence: { value: 0.12 },
        uSize: { value: pointSize },
        uPixelRatio: { value: pixelRatio },
        uPointer: { value: new Vector3(999, 999, 999) },
        uPointerForce: { value: 0 },
        uColorA: { value: new Vector3(0.5, 0.85, 0.8) },
        uColorB: { value: new Vector3(0.62, 0.66, 0.74) },
        uOpacity: { value: opacity },
      },
    });

    this.points = new Points(geometry, this.material);
    this.points.frustumCulled = false;
    this._chapter = -1;
  }

  setProgress(chapterProgress) {
    const last = this.textures.length - 1;
    const ia = Math.min(Math.floor(chapterProgress), last);
    const ib = Math.min(ia + 1, last);
    if (ia !== this._chapter) {
      this._chapter = ia;
      this.material.uniforms.uTexA.value = this.textures[ia];
      this.material.uniforms.uTexB.value = this.textures[ib];
    }
    this.material.uniforms.uProgress.value = chapterProgress - ia;
  }

  update(time, { turbulence, accentRGB, pointerWorld, pointerForce }) {
    const u = this.material.uniforms;
    u.uTime.value = time;
    u.uTurbulence.value = turbulence;
    u.uColorA.value.set(accentRGB[0], accentRGB[1], accentRGB[2]);
    if (pointerWorld) u.uPointer.value.copy(pointerWorld);
    u.uPointerForce.value = pointerForce;
  }

  setPixelRatio(pr) {
    this.material.uniforms.uPixelRatio.value = pr;
  }

  dispose() {
    this.textures.forEach((t) => t.dispose());
    this.points.geometry.dispose();
    this.material.dispose();
  }
}
