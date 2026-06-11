import { isTouchPrimary } from '../utils/env.js';

const TIERS = {
  high: { textureSize: 256, dprCap: 2, pointSize: 3.4, opacity: 0.5 },
  mid: { textureSize: 128, dprCap: 1.5, pointSize: 5.2, opacity: 0.42 },
  low: { textureSize: 64, dprCap: 1, pointSize: 7.5, opacity: 0.48 },
};

export class QualityManager {
  constructor() {
    const coarse = isTouchPrimary();
    const smallScreen = Math.min(screen.width, screen.height) < 800;
    const lowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory < 4;
    this.tierName = (coarse && smallScreen) || lowMemory ? 'mid' : 'high';

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
