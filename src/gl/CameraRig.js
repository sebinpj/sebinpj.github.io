import { damp, lerp } from '../utils/math.js';

// One spherical keyframe per chapter: radius, azimuth, elevation. The swings
// are gentle — the dioramas sit off-centre in the reserved stage column, so
// big orbits would throw them off screen. Pointer parallax rides on top.
// Elevation descends with the story — the camera starts high above the
// summit's cloud sea and settles to ground level by origins.
const KEYFRAMES = [
  { r: 9.5, az: -0.1, el: 0.18 }, //  00 hero — the summit
  { r: 9.0, az: 0.18, el: 0.13 }, //  01 maggi
  { r: 9.6, az: -0.16, el: 0.2 }, //  02 magnit — slightly above the machine
  { r: 9.4, az: 0.14, el: 0.1 }, //   03 willhire
  { r: 8.8, az: -0.2, el: 0.08 }, //  04 psctalks
  { r: 9.2, az: 0.16, el: 0.05 }, //  05 edstem
  { r: 9.0, az: -0.14, el: 0.02 }, // 06 origins — ground level
  { r: 10.5, az: 0.1, el: 0.08 }, //  07 projects — pulled back
  { r: 9.8, az: 0.0, el: 0.05 }, //   08 contact
];

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.current = { ...KEYFRAMES[0] };
    this.parallax = { x: 0, y: 0 };
    this.parallaxTarget = { x: 0, y: 0 };
  }

  setPointer(nx, ny) {
    // nx/ny in -1..1
    this.parallaxTarget.x = nx * 0.04;
    this.parallaxTarget.y = ny * 0.03;
  }

  update(chapterProgress, dt) {
    const last = KEYFRAMES.length - 1;
    const ia = Math.min(Math.floor(chapterProgress), last);
    const ib = Math.min(ia + 1, last);
    const f = chapterProgress - ia;
    const e = f * f * (3 - 2 * f);

    const a = KEYFRAMES[ia];
    const b = KEYFRAMES[ib];

    // Damped pursuit — fast scroll never snaps the camera.
    this.current.r = damp(this.current.r, lerp(a.r, b.r, e), 4, dt);
    this.current.az = damp(this.current.az, lerp(a.az, b.az, e), 4, dt);
    this.current.el = damp(this.current.el, lerp(a.el, b.el, e), 4, dt);

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
