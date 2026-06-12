// Tiny primitive kit the diorama sets are assembled from. Everything is a
// low-poly three primitive with a toon material and an ink outline — the
// whole cast is built from boxes, spheres, cones and tori.

import {
  BoxGeometry,
  CapsuleGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  Shape,
  SphereGeometry,
  TorusGeometry,
} from 'three';
import { PALETTE, blobShadowMaterial, toonMat, withOutline } from '../toon.js';

export function mesh(geometry, color, outline = true) {
  const m = new Mesh(geometry, toonMat(color));
  return outline ? withOutline(m) : m;
}

export const box = (w, h, d, color, outline) => mesh(new BoxGeometry(w, h, d), color, outline);
export const sphere = (r, color, outline, seg = 20) =>
  mesh(new SphereGeometry(r, seg, Math.max(8, seg / 2)), color, outline);
export const cyl = (rt, rb, h, color, outline, seg = 24) =>
  mesh(new CylinderGeometry(rt, rb, h, seg), color, outline);
export const cone = (r, h, color, outline, seg = 24) =>
  mesh(new ConeGeometry(r, h, seg), color, outline);
export const torus = (r, tube, color, arc = Math.PI * 2, outline) =>
  mesh(new TorusGeometry(r, tube, 12, 36, arc), color, outline);
export const octa = (r, color) => mesh(new OctahedronGeometry(r), color);
export const capsule = (r, len, color) => mesh(new CapsuleGeometry(r, len, 6, 12), color);

// Soft ground shadow — a textured disc, not a shadow map.
export function blobShadow(r, y = -1.5) {
  const m = new Mesh(new CircleGeometry(r, 24), blobShadowMaterial());
  m.rotation.x = -Math.PI / 2;
  m.position.y = y;
  m.renderOrder = -1;
  return m;
}

let starGeo = null;

export function star(size, color) {
  if (!starGeo) {
    const shape = new Shape();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? 1 : 0.45;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    starGeo = new ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false });
    starGeo.translate(0, 0, -0.15);
  }
  const m = mesh(starGeo, color);
  m.scale.setScalar(size);
  return m;
}

// A puffy three-lobe cloud.
export function cloud(scale = 1, color = PALETTE.white) {
  const g = new Group();
  const a = sphere(0.42, color);
  const b = sphere(0.32, color);
  const c = sphere(0.3, color);
  b.position.set(0.42, -0.05, 0.05);
  c.position.set(-0.4, -0.07, -0.02);
  g.add(a, b, c);
  g.scale.setScalar(scale);
  return g;
}

// Chat bubble: squashed sphere + a little tail.
export function chatBubble(color) {
  const g = new Group();
  const body = sphere(0.34, color);
  body.scale.set(1.25, 0.95, 0.7);
  const tail = cone(0.1, 0.22, color);
  tail.position.set(-0.22, -0.36, 0);
  tail.rotation.z = 0.6;
  g.add(body, tail);
  return g;
}

// Cartoon eyes: white discs with ink pupils. Instant character.
export function eyes(spread = 0.28, size = 0.13) {
  const g = new Group();
  for (const side of [-1, 1]) {
    const white = sphere(size, PALETTE.white, false, 14);
    white.scale.z = 0.4;
    white.position.x = side * spread;
    const pupil = sphere(size * 0.45, PALETTE.ink, false, 10);
    pupil.scale.z = 0.4;
    pupil.position.set(side * spread, 0.01, size * 0.28);
    g.add(white, pupil);
  }
  return g;
}

// A friendly little phone: ink body, light screen, optional content rows.
export function phone(w, h, screenColor, rows = []) {
  const g = new Group();
  const body = box(w, h, 0.14, PALETTE.ink);
  const screen = box(w * 0.86, h * 0.88, 0.05, screenColor, false);
  screen.position.z = 0.08;
  g.add(body, screen);
  rows.forEach(([rw, rh, color, x, y]) => {
    const row = box(rw, rh, 0.03, color, false);
    row.position.set(x, y, 0.12);
    g.add(row);
  });
  return g;
}

// A summit pavilion: stone plinth, vermillion pillars, two stacked pyramid
// roofs (4-segment cones turned 45°) and a gold finial. Open on all sides so
// whatever sits inside stays visible.
export function pavilion(scale = 1) {
  const g = new Group();
  const plinth = box(1.45, 0.14, 1.45, PALETTE.earth);
  g.add(plinth);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const pillar = cyl(0.055, 0.055, 0.95, PALETTE.vermillion, false, 10);
      pillar.position.set(sx * 0.58, 0.54, sz * 0.58);
      g.add(pillar);
    }
  }
  const eave = cone(1.3, 0.52, PALETTE.vermillion, true, 4);
  eave.rotation.y = Math.PI / 4;
  eave.position.y = 1.22;
  const crest = cone(0.78, 0.4, PALETTE.vermillion, true, 4);
  crest.rotation.y = Math.PI / 4;
  crest.position.y = 1.62;
  const finial = octa(0.12, PALETTE.gold);
  finial.position.y = 1.9;
  g.add(eave, crest, finial);
  g.scale.setScalar(scale);
  return g;
}

// A paper lantern: squashed sphere body, gold caps, a little tassel.
export function lantern(scale = 1, color = PALETTE.vermillion) {
  const g = new Group();
  const body = sphere(0.3, color, true, 16);
  body.scale.y = 1.12;
  const capTop = cyl(0.13, 0.17, 0.1, PALETTE.gold);
  capTop.position.y = 0.34;
  const capBottom = cyl(0.17, 0.13, 0.1, PALETTE.gold);
  capBottom.position.y = -0.34;
  const tassel = cyl(0.022, 0.022, 0.24, PALETTE.gold, false, 8);
  tassel.position.y = -0.52;
  g.add(body, capTop, capBottom, tassel);
  g.scale.setScalar(scale);
  return g;
}

// An open scroll: rice paper between two rollers with gold end-knobs,
// optional faint content rows (same row recipe as the phone screen).
export function scrollProp(scale = 1, rows = []) {
  const g = new Group();
  const paper = box(1.7, 1.05, 0.06, PALETTE.rice);
  g.add(paper);
  for (const sx of [-1, 1]) {
    const roller = cyl(0.09, 0.09, 1.25, PALETTE.earth, true, 12);
    roller.position.set(sx * 0.9, 0, 0);
    g.add(roller);
    for (const sy of [-1, 1]) {
      const knob = sphere(0.11, PALETTE.gold, true, 12);
      knob.position.set(sx * 0.9, sy * 0.66, 0);
      g.add(knob);
    }
  }
  rows.forEach(([rw, rh, color, x, y]) => {
    const row = box(rw, rh, 0.03, color, false);
    row.position.set(x, y, 0.06);
    g.add(row);
  });
  g.scale.setScalar(scale);
  return g;
}

// A mountain gate: two stone pillars under stacked vermillion lintels,
// crowned with a small gold roof peak.
export function gate(scale = 1) {
  const g = new Group();
  for (const sx of [-1, 1]) {
    const pillar = box(0.24, 1.75, 0.24, PALETTE.earth);
    pillar.position.set(sx * 0.8, 0.875, 0);
    g.add(pillar);
  }
  const lower = box(2.05, 0.18, 0.3, PALETTE.vermillion);
  lower.position.y = 1.78;
  const upper = box(2.35, 0.2, 0.34, PALETTE.vermillion);
  upper.position.y = 2.06;
  const peak = cone(0.22, 0.2, PALETTE.gold, true, 4);
  peak.rotation.y = Math.PI / 4;
  peak.position.y = 2.26;
  g.add(lower, upper, peak);
  g.scale.setScalar(scale);
  return g;
}

// A wide translucent mist bank — no outline, additive-free, one shared
// material exposed on userData so the atmosphere can fade it per frame.
export function mistBand(scale = 1, opacity = 0.45) {
  const g = new Group();
  const mat = new MeshBasicMaterial({
    color: PALETTE.mist,
    transparent: true,
    opacity,
    depthWrite: false,
    toneMapped: false,
  });
  const lobes = [
    [0, 0, 0, 1],
    [1.1, 0.08, 0.2, 0.72],
    [-1.05, 0.05, -0.15, 0.8],
    [2.0, -0.05, 0.1, 0.5],
  ];
  for (const [x, y, z, s] of lobes) {
    const lobe = new Mesh(new SphereGeometry(0.55, 14, 8), mat);
    lobe.scale.set(2.1 * s, 0.5 * s, 1.0 * s);
    lobe.position.set(x, y, z);
    g.add(lobe);
  }
  g.userData.material = mat;
  g.scale.setScalar(scale);
  return g;
}

// A stylized palm — Kerala's cameo.
export function palm(scale = 1) {
  const g = new Group();
  const trunk = cyl(0.07, 0.11, 1.1, PALETTE.earth);
  trunk.rotation.z = -0.12;
  trunk.position.y = 0.55;
  g.add(trunk);
  for (let i = 0; i < 5; i += 1) {
    const leaf = sphere(0.34, PALETTE.leaf, true, 12);
    leaf.scale.set(1.6, 0.32, 0.55);
    const a = (i / 5) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.38 + 0.08, 1.16 + Math.sin(i * 2.1) * 0.06, Math.sin(a) * 0.38);
    leaf.rotation.set(0, -a, Math.cos(a) * 0.45);
    g.add(leaf);
  }
  g.scale.setScalar(scale);
  return g;
}
