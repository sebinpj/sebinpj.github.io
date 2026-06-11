// Shared scroll-driven state. GSAP writes it; the WebGL loop reads it every
// frame. Keeping this a plain object means zero coupling between the two
// bundles — the GL chunk can load (or fail) independently of the motion layer.

// Accent hue per chapter (OKLCH hue): cool signal teal through deep indigo and
// violet as the career story builds, landing on warm amber for "let's build".
export const CHAPTER_HUES = [185, 197, 208, 165, 232, 252, 292, 318, 85];

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
