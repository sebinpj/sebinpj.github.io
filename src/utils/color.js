// Minimal OKLCH → linear sRGB conversion so the WebGL accent color can track
// the same --accent-h custom property the CSS uses.

export function oklchToLinearSRGB(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  return [clamp01(r), clamp01(g), clamp01(bl)];
}

// Raw ShaderMaterial output skips three's color-space pipeline, so encode to
// sRGB on the CPU before handing the color to the uniform.
export function oklchToSRGB(L, C, hDeg) {
  return oklchToLinearSRGB(L, C, hDeg).map((v) =>
    v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055,
  );
}
