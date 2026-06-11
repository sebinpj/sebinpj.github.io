import { damp, lerp } from '../utils/math.js';

// One spherical keyframe per chapter: radius, azimuth, elevation, and a small
// lateral look-target shift. The rig eases through them as the story scrolls.
// xf scales the lateral scene offset (1 = clear of the text column, 0 = centred).
const KEYFRAMES = [
  { r: 10.5, az: 0.0, el: 0.04, xf: 1 }, //   00 hero — head-on signal cloud
  { r: 9.0, az: 0.55, el: 0.18, xf: 1 }, //  01 origins — drift around the lattice
  { r: 9.6, az: -0.5, el: 0.06, xf: 1 }, //  02 edstem — alongside the streams
  { r: 8.6, az: 0.35, el: -0.06, xf: 1 }, // 03 psctalks — look up at the monolith
  { r: 10.2, az: -0.55, el: 0.22, xf: 1 }, //04 willhire — above the merge
  { r: 9.2, az: 0.18, el: 0.45, xf: 0.8 }, //05 magnit — looking down the ocean
  { r: 8.8, az: -0.35, el: 0.12, xf: 1 }, // 06 maggi — inside the constellation
  { r: 12.5, az: 0.45, el: 0.25, xf: 0.6 }, //07 projects — pull back, see the network
  { r: 11.0, az: 0.0, el: 0.62, xf: 0 }, //  08 contact — centred calm halo
];

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.current = { ...KEYFRAMES[0] };
    this.parallax = { x: 0, y: 0 };
    this.parallaxTarget = { x: 0, y: 0 };
    this.xFactor = 1;
  }

  setPointer(nx, ny) {
    // nx/ny in -1..1
    this.parallaxTarget.x = nx * 0.035;
    this.parallaxTarget.y = ny * 0.025;
  }

  update(chapterProgress, dt) {
    const last = KEYFRAMES.length - 1;
    const ia = Math.min(Math.floor(chapterProgress), last);
    const ib = Math.min(ia + 1, last);
    const f = chapterProgress - ia;
    const e = f * f * (3 - 2 * f);

    const a = KEYFRAMES[ia];
    const b = KEYFRAMES[ib];
    const target = {
      r: lerp(a.r, b.r, e),
      az: lerp(a.az, b.az, e),
      el: lerp(a.el, b.el, e),
    };

    // Damped pursuit — fast scroll never snaps the camera.
    this.current.r = damp(this.current.r, target.r, 4, dt);
    this.current.az = damp(this.current.az, target.az, 4, dt);
    this.current.el = damp(this.current.el, target.el, 4, dt);
    this.xFactor = damp(this.xFactor, lerp(a.xf, b.xf, e), 4, dt);

    this.parallax.x = damp(this.parallax.x, this.parallaxTarget.x, 5, dt);
    this.parallax.y = damp(this.parallax.y, this.parallaxTarget.y, 5, dt);

    const az = this.current.az + this.parallax.x;
    const el = this.current.el + this.parallax.y;
    const { r } = this.current;

    this.camera.position.set(
      r * Math.cos(el) * Math.sin(az),
      r * Math.sin(el),
      r * Math.cos(el) * Math.cos(az),
    );
    this.camera.lookAt(0, 0, 0);
  }
}
