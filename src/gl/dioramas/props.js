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

// A stylized palm — Kerala's cameo.
export function palm(scale = 1) {
  const g = new Group();
  const trunk = cyl(0.07, 0.11, 1.1, PALETTE.brown);
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
