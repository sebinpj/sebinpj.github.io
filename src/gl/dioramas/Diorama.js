import { Group } from 'three';
import { clamp } from '../../utils/math.js';

// Same overshoot curve GSAP calls back.out — but evaluated per scroll
// position, so the pop-in scrubs deterministically in both directions.
function backOut(t, s = 1.9) {
  const u = t - 1;
  return 1 + (s + 1) * u * u * u + s * u * u;
}

// A diorama is a Group of "props". Each prop pops in (scale 0 → overshoot → 1,
// rising from a small drop) inside its own window of the 0..1 progress —
// a pure function of progress, never a timeline, so fast scrubbing and
// reversing can't desync it.
export class Diorama extends Group {
  constructor() {
    super();
    this.props = [];
    this._progress = -1;
    this.visible = false;
  }

  // delay: where in 0..1 this prop starts appearing; span: how long it takes.
  prop(object, { delay = 0, span = 0.5, drop = 0.5, idle = null } = {}) {
    object.userData.base = {
      px: object.position.x,
      py: object.position.y,
      pz: object.position.z,
      sx: object.scale.x,
      sy: object.scale.y,
      sz: object.scale.z,
      rx: object.rotation.x,
      ry: object.rotation.y,
      rz: object.rotation.z,
    };
    this.props.push({ object, delay, span, drop, idle });
    this.add(object);
    return object;
  }

  setProgress(p) {
    if (p === this._progress) return;
    this._progress = p;
    this.visible = p > 0.001;
    if (!this.visible) return;
    for (const { object, delay, span, drop } of this.props) {
      const t = clamp((p - delay) / span, 0, 1);
      const s = t === 1 ? 1 : Math.max(0, backOut(t));
      const b = object.userData.base;
      object.visible = t > 0.001;
      object.scale.set(b.sx * s, b.sy * s, b.sz * s);
      object.position.y = b.py - (1 - t) * drop;
    }
  }

  // Gentle idle motion — only once a prop has fully landed, so it never
  // fights the scrub-driven pop.
  update(time) {
    if (this._progress < 0.999) return;
    for (const { object, idle } of this.props) {
      idle?.(object, time, object.userData.base);
    }
  }
}
