import { Group } from 'three';
import { BUILDERS } from './dioramas/sets.js';
import { clamp } from '../utils/math.js';

// Which side of the copy each chapter's set lives on (mirrors the CSS
// chapter--flip alternation), plus per-chapter scale/altitude tweaks.
// x is a multiplier on the responsive base offset. Optional m overrides
// the default raised-and-centred mobile placement.
const LAYOUT = [
  { x: 1, y: 0, s: 1, m: { y: -3.0, s: 0.36 } }, // 00 hero — mobile: tucked under the chip cloud; the summit clears as you scroll
  { x: -1, y: 0, s: 1 }, //   01 maggi — stage left
  { x: 1.12, y: 0, s: 0.85, m: { x: 1.0, y: -1.4, s: 0.38 } }, // 02 magnit — wide machine, nudged clear of the copy; mobile: beside the stat stack
  { x: -1, y: 0, s: 1, m: { y: -3.1, s: 0.45 } }, // 03 willhire — mobile: below the closing line, clear of the merge chips
  { x: 1, y: 0, s: 1, m: { y: -2.6, s: 0.45 } }, // 04 psctalks — the pagoda is tall; drop and shrink so the finial clears the copy
  { x: -1, y: 0, s: 1, m: { y: -3.8, s: 0.36 } }, // 05 edstem — long copy on mobile; tuck the scroll below the chips
  { x: 1, y: 0, s: 1, m: { y: -3.2, s: 0.45 } }, // 06 origins — mobile: the little stack sits under the closing line
  { x: 1.3, y: 1.5, s: 0.6, m: { x: 0.9, y: 3.9, s: 0.36 } }, // 07 projects — small, peeking over the cards; mobile: tucked top-right above the title
  { x: 1.25, y: -1.6, s: 0.85, m: { x: -1.2, y: -2.4, s: 0.5 } }, // 08 contact — planted at ground level, right of the centred sign-off. Mobile: below the links
];

// The outgoing set packs up over the first 45% of a transition, the next one
// unpacks over the last 45% — a brief clear stage in between keeps the swap
// readable instead of two sets cross-fading into mush.
const SWAP = 0.45;

export class DioramaStage {
  constructor() {
    this.group = new Group();
    this._cache = new Array(BUILDERS.length).fill(null);
    this._layout = { baseX: 2.6, mobile: false, k: 1 };
    this._progress = -1;
  }

  _get(i) {
    if (!this._cache[i]) {
      this._cache[i] = BUILDERS[i]();
      this._place(i);
      this.group.add(this._cache[i]);
    }
    return this._cache[i];
  }

  _place(i) {
    const d = this._cache[i];
    if (!d) return;
    const { x, y, s, m } = LAYOUT[i];
    const { baseX, mobile, k } = this._layout;
    if (mobile) {
      // The stage zone sits below the copy on small screens — drop and shrink.
      d.position.set(m?.x ?? 0, m?.y ?? -2.2 + y * 0.35, 0);
      d.scale.setScalar(m?.s ?? 0.55 * s);
    } else {
      d.position.set(baseX * x, y, 0);
      d.scale.setScalar(s * k);
    }
  }

  setLayout(baseX, mobile, k = 1) {
    this._layout = { baseX, mobile, k };
    for (let i = 0; i < this._cache.length; i += 1) this._place(i);
  }

  setProgress(cp) {
    if (cp === this._progress) return;
    this._progress = cp;
    const last = BUILDERS.length - 1;
    const ia = Math.min(Math.floor(clamp(cp, 0, last)), last);
    const f = clamp(cp, 0, last) - ia;

    for (let i = 0; i < this._cache.length; i += 1) {
      if (this._cache[i] && i !== ia && i !== ia + 1) this._cache[i].setProgress(0);
    }
    this._get(ia).setProgress(f < 0.001 ? 1 : clamp(1 - f / SWAP, 0, 1));
    if (ia < last && f > 1 - SWAP) {
      this._get(ia + 1).setProgress(clamp((f - (1 - SWAP)) / SWAP, 0, 1));
    }
  }

  update(time) {
    for (const d of this._cache) {
      if (d?.visible) d.update(time);
    }
  }

  dispose() {
    this.group.traverse((o) => {
      o.geometry?.dispose?.();
      if (o.material?.map) o.material.map.dispose();
      o.material?.dispose?.();
    });
  }
}
