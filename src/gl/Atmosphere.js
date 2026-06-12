// Background air: flat ink-wash mountain ridges, a drifting cloud sea that
// thins as the story descends, and a handful of qi wisps. Everything is a
// MeshBasicMaterial — no lights, no outlines, ~12 draw calls, and the only
// per-frame work is a few position/opacity writes.

import {
  Group,
  Mesh,
  MeshBasicMaterial,
  Shape,
  ShapeGeometry,
  SphereGeometry,
} from 'three';
import { PALETTE } from './toon.js';
import { mistBand } from './dioramas/props.js';
import { clamp } from '../utils/math.js';

// One ridge silhouette: a polyline closed down to a deep base so the wash
// always reaches the bottom of the frame. Coordinates are world units.
function ridge(points, opacity, z) {
  const shape = new Shape();
  shape.moveTo(points[0][0], -8);
  points.forEach(([x, y]) => shape.lineTo(x, y));
  shape.lineTo(points[points.length - 1][0], -8);
  shape.closePath();
  const m = new Mesh(
    new ShapeGeometry(shape),
    new MeshBasicMaterial({
      color: PALETTE.slate,
      transparent: true,
      opacity,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  m.position.z = z;
  m.renderOrder = -4;
  return m;
}

const MISTS = [
  // [x, y, z, scale, base opacity, drift amplitude, drift speed, phase]
  [-3.4, -3.0, -4, 2.2, 0.34, 0.8, 0.05, 0],
  [3.4, -2.2, -5, 1.8, 0.26, 1.0, 0.04, 2.1],
  [0.2, -3.6, -3, 2.6, 0.2, 0.6, 0.06, 4.2],
];

const WISPS = [
  // [cx, cy, x amplitude, y amplitude, x freq, y freq, phase, color]
  [-4.2, 1.6, 0.5, 0.4, 0.21, 0.33, 0.0, 'gold'],
  [4.6, 2.2, 0.6, 0.5, 0.17, 0.27, 1.3, 'jade'],
  [-3.0, -0.6, 0.4, 0.6, 0.27, 0.19, 2.6, 'jade'],
  [3.4, 0.2, 0.5, 0.4, 0.23, 0.31, 3.9, 'gold'],
  [-5.0, 3.0, 0.7, 0.3, 0.15, 0.25, 5.2, 'gold'],
  [5.4, -1.4, 0.4, 0.5, 0.29, 0.21, 0.7, 'jade'],
];

export class Atmosphere {
  constructor() {
    this.group = new Group();

    // Three flat washes, lighter and taller as they recede — the donghua
    // backdrop. All peaks stay below the copy line; the wash hugs the foot
    // of the frame.
    this.group.add(
      ridge([[-11, -3.8], [-8, -2.0], [-5.5, -3.2], [-2.5, -1.6], [0.5, -3.4], [4, -2.2], [7, -3.6], [11, -2.6]], 0.1, -7),
      ridge([[-16, -3.4], [-12, -0.4], [-8, -2.2], [-4, 0.4], [0, -1.6], [5, -0.2], [9, -2.0], [13, -0.8], [16, -3.0]], 0.075, -10),
      ridge([[-22, -2.6], [-16, 1.2], [-11, -0.6], [-5, 2.0], [0, 0.0], [6, 1.5], [12, -1.0], [18, 0.8], [22, -1.8]], 0.05, -14),
    );

    this._mists = MISTS.map(([x, y, z, s, o, amp, speed, phase]) => {
      const band = mistBand(s, o);
      band.position.set(x, y, z);
      band.renderOrder = -3;
      this.group.add(band);
      return { band, x, amp, speed, phase, base: o };
    });

    const wispGeo = new SphereGeometry(0.07, 10, 6);
    const wispMats = {
      gold: new MeshBasicMaterial({ color: PALETTE.gold, transparent: true, toneMapped: false }),
      jade: new MeshBasicMaterial({ color: PALETTE.jade, transparent: true, toneMapped: false }),
    };
    this._wispMats = Object.values(wispMats);
    this._wisps = WISPS.map(([cx, cy, ax, ay, fx, fy, phase, color]) => {
      const m = new Mesh(wispGeo, wispMats[color]);
      m.position.set(cx, cy, -2.5);
      this.group.add(m);
      return { m, cx, cy, ax, ay, fx, fy, phase };
    });
  }

  update(time, cp) {
    // The cloud sea belongs to the summit; by origins (chapter 6) the air is
    // nearly clear. The epilogue chapters keep the thin floor value.
    const fade = 0.12 + 0.88 * (1 - clamp(cp / 6, 0, 1));

    for (const w of this._mists) {
      w.band.position.x = w.x + Math.sin(time * w.speed * Math.PI * 2 + w.phase) * w.amp;
      w.band.userData.material.opacity = w.base * fade;
    }

    for (const mat of this._wispMats) mat.opacity = 0.15 + 0.7 * fade;
    for (const w of this._wisps) {
      w.m.position.x = w.cx + Math.sin(time * w.fx * Math.PI * 2 + w.phase) * w.ax;
      w.m.position.y = w.cy + Math.sin(time * w.fy * Math.PI * 2 + w.phase * 1.7) * w.ay;
    }
  }

  dispose() {
    this.group.traverse((o) => {
      o.geometry?.dispose?.();
      o.material?.dispose?.();
    });
  }
}
