import { isTouchPrimary } from '../utils/env.js';

// The toon stage is light (a few hundred low-poly meshes at most), so tiers
// mostly govern pixel ratio; `low` also drops the inverted-hull outlines,
// which halve the draw-call count.
const TIERS = {
  high: { dprCap: 2, outlines: true, atmosphere: true },
  mid: { dprCap: 1.5, outlines: true, atmosphere: true },
  low: { dprCap: 1, outlines: false, atmosphere: false },
};

export class QualityManager {
  constructor() {
    const coarse = isTouchPrimary();
    const smallScreen = Math.min(screen.width, screen.height) < 800;
    const lowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory < 4;
    this.tierName = lowMemory ? 'low' : coarse && smallScreen ? 'mid' : 'high';

    // Rolling FPS watchdog: sustained slow frames step the pixel ratio down
    // before they ever read as jank.
    this._slowWindows = 0;
    this._fastWindows = 0;
    this._frameCount = 0;
    this._elapsed = 0;
    this.dprScale = 1;
    this.onDemote = null;
  }

  get tier() {
    return TIERS[this.tierName];
  }

  pixelRatio() {
    return Math.min(devicePixelRatio || 1, this.tier.dprCap) * this.dprScale;
  }

  tick(dt) {
    this._elapsed += dt;
    this._frameCount += 1;
    if (this._elapsed >= 1) {
      const avgFrame = this._elapsed / this._frameCount;
      this._slowWindows = avgFrame > 0.022 ? this._slowWindows + 1 : 0;
      // Comfortable headroom (~55+ fps) earns back resolution lost to a
      // transient stall — otherwise one busy moment (tab switch, GC, an OS
      // hiccup) leaves the canvas soft for the whole session. The recovery
      // bar (10 calm windows vs 3 slow ones) is deliberately asymmetric so
      // a genuinely weak GPU doesn't oscillate between sharp and slow.
      this._fastWindows = avgFrame < 0.018 ? this._fastWindows + 1 : 0;
      this._elapsed = 0;
      this._frameCount = 0;

      if (this._slowWindows >= 3) {
        this._slowWindows = 0;
        this._fastWindows = 0;
        if (this.dprScale > 0.55) {
          this.dprScale = Math.max(0.5, this.dprScale - 0.25);
          this.onDemote?.();
        }
      } else if (this._fastWindows >= 10 && this.dprScale < 1) {
        this._fastWindows = 0;
        this.dprScale = Math.min(1, this.dprScale + 0.25);
        this.onDemote?.(); // same hook: re-applies renderer size
      }
    }
  }
}
