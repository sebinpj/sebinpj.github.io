// Shared scroll-driven state. GSAP writes it; the WebGL loop reads it every
// frame. Keeping this a plain object means zero coupling between the two
// bundles — the GL chunk can load (or fail) independently of the motion layer.

// Accent hue per chapter (OKLCH hue) — candy progression matching the static
// band tints in sections.css: sky, sunflower, mint, grape, coral, ocean,
// bubblegum, lime, and a warm golden send-off.
export const CHAPTER_HUES = [230, 90, 150, 310, 30, 220, 350, 120, 85];

export const glState = {
  // 0..8 — fractional while morphing between chapter forms.
  chapterProgress: 0,
  // Mirrors the CSS --accent-h custom property.
  accentH: CHAPTER_HUES[0],
  // 0..1 — overall page scroll, used for slow global camera drift.
  pageProgress: 0,
  // Extra turbulence injected near morph midpoints (set by the GL layer).
  scrollVelocity: 0,
};
