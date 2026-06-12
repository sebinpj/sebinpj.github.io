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
      this._elapsed = 0;
      this._frameCount = 0;

      if (this._slowWindows >= 3) {
        this._slowWindows = 0;
        if (this.dprScale > 0.55) {
          this.dprScale = Math.max(0.5, this.dprScale - 0.25);
          this.onDemote?.();
        }
      }
    }
  }
}
