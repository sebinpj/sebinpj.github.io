// The nine story sets. Each builder returns a Diorama whose props pop in
// with staggered delays (scrub-driven) and carry small time-based idles
// that only run once the set has fully landed.

import { Group } from 'three';
import { Diorama } from './Diorama.js';
import { PALETTE as P } from '../toon.js';
import {
  blobShadow,
  box,
  capsule,
  chatBubble,
  cloud,
  cone,
  cyl,
  eyes,
  octa,
  palm,
  phone,
  sphere,
  star,
  torus,
} from './props.js';

const bob = (amp = 0.07, speed = 1, phase = 0) => (o, t, b) => {
  o.position.y = b.py + Math.sin(t * speed + phase) * amp;
};
const spin = (speed = 0.4, axis = 'y') => (o, t, b) => {
  o.rotation[axis] = b['r' + axis] + t * speed;
};
const sway = (amp = 0.05, speed = 1, phase = 0) => (o, t, b) => {
  o.rotation.z = b.rz + Math.sin(t * speed + phase) * amp;
};

// 00 · hero — a little floating island where the work happens.
export function buildHero() {
  const d = new Diorama();
  d.prop(blobShadow(1.9, -2.1), { delay: 0, span: 0.3, drop: 0 });

  const island = new Group();
  const rock = cone(1.55, 1.5, P.brown);
  rock.rotation.x = Math.PI;
  rock.position.y = -1.0;
  const grass = cyl(1.6, 1.5, 0.42, P.leaf);
  grass.position.y = -0.18;
  island.add(rock, grass);
  for (let i = 0; i < 4; i += 1) {
    const tuft = sphere(0.16, P.mint, true, 10);
    tuft.position.set(Math.cos(i * 2.3) * 1.15, 0.05, Math.sin(i * 2.3) * 1.05);
    tuft.scale.y = 0.6;
    island.add(tuft);
  }
  d.prop(island, { delay: 0, span: 0.45, drop: 0.8, idle: bob(0.06, 0.7) });

  const desk = new Group();
  const top = box(1.05, 0.09, 0.65, P.brown);
  for (const sx of [-1, 1]) {
    const leg = box(0.07, 0.42, 0.07, P.ink, false);
    leg.position.set(sx * 0.42, -0.25, 0);
    desk.add(leg);
  }
  const base = box(0.52, 0.05, 0.38, P.slate);
  base.position.set(0.02, 0.07, 0.05);
  const screen = box(0.52, 0.38, 0.05, P.sky);
  screen.position.set(0.02, 0.26, -0.1);
  screen.rotation.x = -0.18;
  desk.add(top, base, screen);
  desk.position.set(0.25, 0.45, 0.15);
  d.prop(desk, { delay: 0.2, span: 0.4, drop: 0.6 });

  const tree = palm(0.85);
  tree.position.set(-1.05, -0.05, -0.35);
  d.prop(tree, { delay: 0.3, span: 0.4, drop: 0.5, idle: sway(0.04, 0.9) });

  const sun = new Group();
  sun.add(sphere(0.4, P.sunflower));
  for (let i = 0; i < 8; i += 1) {
    const ray = cone(0.07, 0.26, P.sunflower, false);
    const a = (i / 8) * Math.PI * 2;
    ray.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0);
    ray.rotation.z = a - Math.PI / 2;
    sun.add(ray);
  }
  sun.position.set(1.75, 2.0, -0.7);
  d.prop(sun, { delay: 0.45, span: 0.4, drop: 0.3, idle: spin(0.25, 'z') });

  const cloudA = cloud(0.9);
  cloudA.position.set(-1.8, 1.5, -0.6);
  d.prop(cloudA, { delay: 0.55, span: 0.4, drop: 0.25, idle: bob(0.05, 0.55, 1.7) });
  const cloudB = cloud(0.6);
  cloudB.position.set(1.1, 2.6, 0.3);
  d.prop(cloudB, { delay: 0.65, span: 0.35, drop: 0.25, idle: bob(0.05, 0.7, 4.1) });

  return d;
}

// 01 · origins — a stack of borrowed knowledge and one bright idea.
export function buildOrigins() {
  const d = new Diorama();
  d.prop(blobShadow(1.7, -1.6), { delay: 0, span: 0.3, drop: 0 });

  const colors = [P.coral, P.sky, P.sunflower, P.mint];
  colors.forEach((c, i) => {
    const b = box(1.65 - i * 0.12, 0.26, 1.05, c);
    b.position.y = -1.25 + i * 0.27;
    b.rotation.y = (i % 2 ? -1 : 1) * (0.12 + i * 0.05);
    d.prop(b, { delay: 0.05 + i * 0.08, span: 0.35, drop: 0.5 });
  });

  const bulb = new Group();
  const glass = sphere(0.42, P.sunflower);
  const socket = cyl(0.16, 0.19, 0.24, P.slate);
  socket.position.y = -0.5;
  bulb.add(glass, socket);
  for (let i = 0; i < 5; i += 1) {
    const sparkRay = cone(0.05, 0.2, P.sunflower, false);
    const a = (i / 5) * Math.PI * 2 + 0.3;
    sparkRay.position.set(Math.cos(a) * 0.66, Math.sin(a) * 0.66 + 0.05, 0);
    sparkRay.rotation.z = a - Math.PI / 2;
    bulb.add(sparkRay);
  }
  bulb.position.set(0.1, 0.65, 0);
  d.prop(bulb, { delay: 0.42, span: 0.4, drop: 0.45, idle: bob(0.08, 0.9) });

  const tree = palm(0.8);
  tree.position.set(-1.7, -1.55, -0.5);
  d.prop(tree, { delay: 0.55, span: 0.35, drop: 0.4, idle: sway(0.05, 0.8, 2) });

  const sparkle = octa(0.14, P.coral);
  sparkle.position.set(1.45, 0.6, 0.2);
  d.prop(sparkle, { delay: 0.7, span: 0.3, drop: 0.2, idle: spin(0.9) });

  return d;
}

// 02 · edstem — messages orbiting the phone they were never meant to leave.
export function buildEdstem() {
  const d = new Diorama();
  d.prop(blobShadow(1.6, -1.8), { delay: 0, span: 0.3, drop: 0 });

  const ph = phone(1.15, 2.3, P.cream, [
    [0.62, 0.2, P.mint, -0.12, 0.55],
    [0.5, 0.18, P.sky, 0.18, 0.15],
    [0.62, 0.2, P.mint, -0.12, -0.25],
    [0.42, 0.18, P.sky, 0.2, -0.62],
  ]);
  ph.position.y = -0.4;
  ph.rotation.y = -0.12;
  d.prop(ph, { delay: 0.05, span: 0.45, drop: 0.7, idle: bob(0.05, 0.8) });

  const orbit = new Group();
  const colors = [P.mint, P.white, P.sunflower, P.white];
  for (let i = 0; i < 4; i += 1) {
    const b = chatBubble(colors[i]);
    const a = (i / 4) * Math.PI * 2;
    b.position.set(Math.cos(a) * 1.55, 0.25 + Math.sin(a * 2) * 0.45, Math.sin(a) * 1.05);
    b.rotation.y = -a * 0.4;
    orbit.add(b);
  }
  orbit.position.y = -0.2;
  d.prop(orbit, { delay: 0.45, span: 0.45, drop: 0.4, idle: spin(0.35) });

  return d;
}

// 03 · psctalks — the little app that reached half a million pockets.
export function buildPsctalks() {
  const d = new Diorama();
  d.prop(blobShadow(1.7, -2.0), { delay: 0, span: 0.3, drop: 0 });

  const ph = phone(1.35, 2.7, P.cream, [
    [0.9, 0.34, P.grape, 0, 0.78],
    [0.95, 0.2, P.sunflower, 0, 0.3],
    [0.95, 0.2, P.sunflower, 0, -0.05],
    [0.95, 0.2, P.sunflower, 0, -0.4],
    [0.6, 0.26, P.mint, -0.14, -0.85],
  ]);
  ph.position.y = -0.45;
  ph.rotation.y = 0.1;
  d.prop(ph, { delay: 0.05, span: 0.45, drop: 0.8, idle: bob(0.04, 0.7) });

  const starSpots = [
    [-1.35, 1.25, 0.3, 0.34],
    [1.3, 1.7, -0.2, 0.42],
    [1.5, 0.3, 0.4, 0.26],
  ];
  starSpots.forEach(([x, y, z, s], i) => {
    const st = star(s, P.sunflower);
    st.position.set(x, y, z);
    d.prop(st, { delay: 0.45 + i * 0.12, span: 0.35, drop: 0.3, idle: spin(0.5 + i * 0.2, 'z') });
  });

  const arrows = [
    [-1.5, -0.6, P.coral],
    [1.05, -1.0, P.grape],
  ];
  arrows.forEach(([x, y, c], i) => {
    const arrow = new Group();
    const head = cone(0.18, 0.34, c);
    head.position.y = 0.28;
    const shaft = cyl(0.07, 0.07, 0.42, c);
    shaft.position.y = -0.08;
    arrow.add(head, shaft);
    arrow.position.set(x, y, 0.2);
    d.prop(arrow, { delay: 0.6 + i * 0.12, span: 0.35, drop: 0.35, idle: bob(0.1, 1.3, i * 2) });
  });

  return d;
}

// 04 · willhire — two characters meet; five months later, one name.
export function buildWillhire() {
  const d = new Diorama();
  d.prop(blobShadow(1.2, -1.6).translateX(-1.05), { delay: 0, span: 0.3, drop: 0 });
  d.prop(blobShadow(1.2, -1.6).translateX(1.05), { delay: 0.08, span: 0.3, drop: 0 });

  const blobA = new Group();
  const bodyA = sphere(0.8, P.coral);
  bodyA.scale.y = 0.92;
  const faceA = eyes(0.26, 0.12);
  faceA.position.set(0.18, 0.18, 0.68);
  blobA.add(bodyA, faceA);
  blobA.position.set(-1.05, -0.7, 0);
  d.prop(blobA, { delay: 0.05, span: 0.4, drop: 0.6, idle: bob(0.06, 1.1) });

  const blobB = new Group();
  const bodyB = sphere(0.62, P.sky);
  const faceB = eyes(0.22, 0.1);
  faceB.position.set(-0.14, 0.14, 0.52);
  blobB.add(bodyB, faceB);
  blobB.position.set(1.1, -0.82, 0);
  d.prop(blobB, { delay: 0.18, span: 0.4, drop: 0.6, idle: bob(0.06, 1.1, Math.PI) });

  const arc = torus(1.08, 0.07, P.sunflower, Math.PI);
  arc.position.y = -0.55;
  d.prop(arc, { delay: 0.5, span: 0.4, drop: 0.3 });

  const heart = octa(0.2, P.bubblegum);
  heart.position.set(0, 0.85, 0);
  d.prop(heart, { delay: 0.72, span: 0.28, drop: 0.3, idle: (o, t, b) => {
    o.rotation.y = t * 0.8;
    const s = 1 + Math.sin(t * 2.4) * 0.12;
    o.scale.set(b.sx * s, b.sy * s, b.sz * s);
  } });

  return d;
}

// 05 · magnit — the pipe machine: Oracle in, Postgres out, live the whole time.
export function buildMagnitData() {
  const d = new Diorama();
  d.prop(blobShadow(2.2, -1.9), { delay: 0, span: 0.3, drop: 0 });

  const funnel = new Group();
  const mouth = cyl(0.85, 0.3, 0.8, P.slate);
  const neck = cyl(0.16, 0.16, 0.5, P.slate);
  neck.position.y = -0.6;
  funnel.add(mouth, neck);
  funnel.position.set(-1.45, 0.95, 0);
  d.prop(funnel, { delay: 0.05, span: 0.4, drop: 0.5 });

  const pipe = new Group();
  const elbow = torus(0.42, 0.17, P.teal, Math.PI / 2);
  elbow.rotation.z = Math.PI;
  elbow.position.set(-1.03, 0.12, 0);
  const run = cyl(0.17, 0.17, 1.9, P.teal);
  run.rotation.z = Math.PI / 2;
  run.position.set(0, -0.3, 0);
  // Outlet curves DOWN into the pool: a 0..90° torus quarter has a horizontal
  // tangent at its top and a vertical one at its right — no rotation needed.
  const outlet = torus(0.42, 0.17, P.teal, Math.PI / 2);
  outlet.position.set(0.95, -0.72, 0);
  const spout = cyl(0.17, 0.17, 0.45, P.teal);
  spout.position.set(1.37, -0.95, 0);
  pipe.add(elbow, run, outlet, spout);
  d.prop(pipe, { delay: 0.25, span: 0.45, drop: 0.4 });

  const pool = new Group();
  pool.add(cyl(0.85, 0.7, 0.5, P.sky));
  for (let i = 0; i < 3; i += 1) {
    const cube = box(0.26, 0.26, 0.26, [P.sunflower, P.coral, P.mint][i], false);
    cube.position.set(Math.cos(i * 2.6) * 0.35, 0.33, Math.sin(i * 2.6) * 0.3);
    cube.rotation.y = i;
    pool.add(cube);
  }
  pool.position.set(1.37, -1.5, 0);
  d.prop(pool, { delay: 0.45, span: 0.4, drop: 0.4 });

  // Cubes riding the pipeline — a deterministic loop along the path.
  const path = (u) => {
    if (u < 0.25) return [-1.45, 1.5 - u * 4 * 1.1, 0]; // falling into the funnel
    if (u < 0.75) {
      const v = (u - 0.25) / 0.5;
      return [-1.03 + v * 2.06, -0.3, 0]; // through the run
    }
    const w = (u - 0.75) / 0.25;
    return [1.03 + w * 0.34, -0.3 - w * 0.95, 0]; // around the outlet, into the pool
  };
  for (let i = 0; i < 4; i += 1) {
    const cube = box(0.2, 0.2, 0.2, [P.sunflower, P.coral, P.mint, P.bubblegum][i]);
    d.prop(cube, { delay: 0.6 + i * 0.06, span: 0.3, drop: 0.2, idle: (o, t, b) => {
      const u = (t * 0.12 + i * 0.25) % 1;
      const [x, y, z] = path(u);
      o.position.set(x, y, z);
      o.rotation.y = b.ry + t * 1.2;
      o.rotation.z = b.rz + t * 0.7;
    } });
  }

  return d;
}

// 06 · maggi — a friendly robot with a head full of sparks.
export function buildMaggi() {
  const d = new Diorama();
  d.prop(blobShadow(1.6, -1.7), { delay: 0, span: 0.3, drop: 0 });

  const head = new Group();
  const skull = box(1.55, 1.25, 1.2, P.white);
  const face = box(1.2, 0.8, 0.08, P.ink, false);
  face.position.set(0, -0.02, 0.62);
  const eyeL = capsule(0.09, 0.12, P.mint);
  eyeL.position.set(-0.3, 0.05, 0.7);
  const eyeR = capsule(0.09, 0.12, P.mint);
  eyeR.position.set(0.3, 0.05, 0.7);
  const mouth = box(0.34, 0.07, 0.04, P.mint, false);
  mouth.position.set(0, -0.3, 0.7);
  for (const side of [-1, 1]) {
    const ear = cyl(0.12, 0.12, 0.18, P.coral);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(side * 0.86, 0, 0);
    head.add(ear);
  }
  head.add(skull, face, eyeL, eyeR, mouth);
  head.position.y = -0.55;
  d.prop(head, { delay: 0.05, span: 0.45, drop: 0.7, idle: (o, t, b) => {
    o.position.y = b.py + Math.sin(t * 0.9) * 0.06;
    o.rotation.z = b.rz + Math.sin(t * 0.6) * 0.04;
  } });

  const antenna = new Group();
  const rod = cyl(0.04, 0.04, 0.5, P.slate);
  const tip = sphere(0.14, P.coral);
  tip.position.y = 0.32;
  antenna.add(rod, tip);
  antenna.position.set(0, 0.35, 0);
  d.prop(antenna, { delay: 0.4, span: 0.35, drop: 0.3, idle: sway(0.12, 1.6) });

  const orbit = new Group();
  const sparkColors = [P.grape, P.sunflower, P.mint, P.coral];
  for (let i = 0; i < 4; i += 1) {
    const sp = octa(0.15, sparkColors[i]);
    const a = (i / 4) * Math.PI * 2;
    sp.position.set(Math.cos(a) * 1.5, 0.1 + Math.sin(a * 2) * 0.5, Math.sin(a) * 1.1);
    orbit.add(sp);
  }
  orbit.position.y = -0.3;
  d.prop(orbit, { delay: 0.55, span: 0.45, drop: 0.3, idle: spin(0.45) });

  return d;
}

// 07 · projects — the trophy shelf.
export function buildProjects() {
  const d = new Diorama();
  d.prop(blobShadow(2.0, -1.75), { delay: 0, span: 0.3, drop: 0 });

  const podiums = [
    [-1.05, 0.7, P.coral],
    [0, 1.1, P.sunflower],
    [1.05, 0.5, P.sky],
  ];
  podiums.forEach(([x, h, c], i) => {
    const p = box(0.92, h, 0.92, c);
    p.position.set(x, -1.7 + h / 2, 0);
    d.prop(p, { delay: 0.05 + i * 0.1, span: 0.35, drop: 0.5 });
  });

  const trophy = new Group();
  const cup = cyl(0.26, 0.14, 0.36, P.sunflower);
  const stem = cyl(0.05, 0.05, 0.18, P.sunflower, false);
  stem.position.y = -0.26;
  const foot = cyl(0.16, 0.18, 0.08, P.brown);
  foot.position.y = -0.38;
  const tStar = star(0.2, P.sunflower);
  tStar.position.y = 0.42;
  trophy.add(cup, stem, foot, tStar);
  trophy.position.set(0, -0.18, 0);
  d.prop(trophy, { delay: 0.4, span: 0.4, drop: 0.5, idle: spin(0.6) });

  const miniPhone = phone(0.42, 0.8, P.grape);
  miniPhone.position.set(-1.05, -0.92, 0);
  miniPhone.rotation.y = 0.25;
  d.prop(miniPhone, { delay: 0.55, span: 0.35, drop: 0.4 });

  const manga = box(0.5, 0.66, 0.12, P.bubblegum);
  manga.position.set(1.05, -1.08, 0);
  manga.rotation.y = -0.3;
  d.prop(manga, { delay: 0.65, span: 0.35, drop: 0.4 });

  return d;
}

// 08 · contact — a paper plane circling the mailbox, waiting for a reply.
export function buildContact() {
  const d = new Diorama();
  d.prop(blobShadow(1.5, -1.8), { delay: 0, span: 0.3, drop: 0 });

  const mailbox = new Group();
  const post = cyl(0.07, 0.09, 1.3, P.brown);
  post.position.y = -1.1;
  const bodyBox = box(0.95, 0.6, 0.6, P.coral);
  bodyBox.position.y = -0.25;
  const lid = cyl(0.3, 0.3, 0.95, P.coral);
  lid.rotation.z = Math.PI / 2;
  lid.scale.y = 1;
  lid.position.y = 0.05;
  const flag = box(0.08, 0.3, 0.05, P.sunflower);
  flag.position.set(0.42, 0.28, 0.2);
  mailbox.add(post, bodyBox, lid, flag);
  mailbox.position.y = 0.15;
  d.prop(mailbox, { delay: 0.05, span: 0.45, drop: 0.7, idle: sway(0.025, 0.8) });

  const envelope = box(0.5, 0.34, 0.05, P.white);
  envelope.position.set(-0.75, -1.55, 0.4);
  envelope.rotation.set(-0.3, 0.4, 0.1);
  d.prop(envelope, { delay: 0.5, span: 0.35, drop: 0.3 });

  const plane = new Group();
  const dart = cone(0.26, 0.8, P.white, true, 4);
  dart.rotation.x = Math.PI / 2;
  dart.scale.set(1, 1, 0.5);
  plane.add(dart);
  d.prop(plane, { delay: 0.6, span: 0.4, drop: 0.3, idle: (o, t) => {
    const a = t * 0.55;
    const r = 1.55;
    o.position.set(Math.cos(a) * r, 0.7 + Math.sin(t * 0.9) * 0.35, Math.sin(a) * r * 0.7);
    // face the direction of travel
    o.rotation.y = -a;
    o.rotation.z = Math.sin(t * 0.9) * 0.25;
  } });

  return d;
}

export const BUILDERS = [
  buildHero,
  buildOrigins,
  buildEdstem,
  buildPsctalks,
  buildWillhire,
  buildMagnitData,
  buildMaggi,
  buildProjects,
  buildContact,
];
