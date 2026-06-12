// Shared cel-shading kit: one 3-step gradient ramp drives every
// MeshToonMaterial, outlines are inverted hulls, shadows are soft blobs.
// No shadow maps, no postprocessing — the look is all material.

import {
  BackSide,
  CanvasTexture,
  Color,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  RedFormat,
} from 'three';

// Candy palette (sRGB hex; three's color management handles the rest).
export const PALETTE = {
  ink: 0x35345a,
  cream: 0xfdf6e8,
  white: 0xffffff,
  coral: 0xf07a5f,
  sunflower: 0xf4b942,
  teal: 0x53b8b0,
  sky: 0x6fb1ea,
  grape: 0xa672d8,
  mint: 0x74c690,
  lime: 0xa8c95e,
  bubblegum: 0xf08bb8,
  brown: 0x9a6b4f,
  leaf: 0x5fae6b,
  slate: 0x7c8bd9,
};

let gradientMap = null;

function getGradientMap() {
  if (!gradientMap) {
    // Three tones: deep shade, mid, lit. Nearest filtering keeps the bands hard.
    const data = new Uint8Array([120, 200, 255]);
    gradientMap = new DataTexture(data, 3, 1, RedFormat);
    gradientMap.minFilter = NearestFilter;
    gradientMap.magFilter = NearestFilter;
    gradientMap.needsUpdate = true;
  }
  return gradientMap;
}

const materialCache = new Map();

export function toonMat(color) {
  if (!materialCache.has(color)) {
    materialCache.set(color, new MeshToonMaterial({ color, gradientMap: getGradientMap() }));
  }
  return materialCache.get(color);
}

const outlineMat = new MeshBasicMaterial({ color: PALETTE.ink, side: BackSide, toneMapped: false });

// Module-level switch — set once at boot from the quality tier, before any
// diorama is built (they're all built lazily afterwards).
let outlinesEnabled = true;
export function setOutlinesEnabled(v) {
  outlinesEnabled = v;
}

// Classic inverted hull: a slightly inflated back-face copy reads as an ink line.
export function withOutline(mesh, thickness = 1.045) {
  if (outlinesEnabled) {
    const hull = new Mesh(mesh.geometry, outlineMat);
    hull.scale.setScalar(thickness);
    mesh.add(hull);
  }
  return mesh;
}

let shadowTexture = null;

function getShadowTexture() {
  if (!shadowTexture) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const ink = new Color(PALETTE.ink);
    const rgb = `${(ink.r * 255) | 0},${(ink.g * 255) | 0},${(ink.b * 255) | 0}`;
    const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
    g.addColorStop(0, `rgba(${rgb},0.32)`);
    g.addColorStop(0.7, `rgba(${rgb},0.14)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    shadowTexture = new CanvasTexture(c);
  }
  return shadowTexture;
}

export function blobShadowMaterial() {
  return new MeshBasicMaterial({
    map: getShadowTexture(),
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
}
