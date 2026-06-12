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
  gate,
  lantern,
  octa,
  palm,
  phone,
  scrollProp,
  sphere,
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

// 00 · hero — the summit workshop: a machine on a floating peak that turns
// raw blocks into the artifacts whose stories the chapters below tell —
// a robot, a phone, a database, a browser. Problems in, products out.
// Deliberately the busiest set on the page; everything below it thins out
// as the story descends.
export function buildHero() {
  const d = new Diorama();
  d.prop(blobShadow(1.9, -2.6), { delay: 0, span: 0.3, drop: 0 });

  // The island bob every grounded piece shares; the loop riders add the
  // same term so they never drift against the lawn.
  const isleBob = (t) => Math.sin(t * 0.7) * 0.06;

  // The peak itself — inverted stone cone, a pine collar, a grassy crown.
  // The machine and tree share its bob (same amp/speed/phase) so the
  // whole summit floats as one piece.
  const peak = new Group();
  // Jagged underside: faceted inverted cones (low radial counts read as
  // rock facets) — a main mass with two tilted shards shouldering out.
  const rock = cone(1.45, 1.6, P.earth, true, 6);
  rock.rotation.set(Math.PI, 0.5, 0.08);
  rock.position.y = -1.3;
  const shardA = cone(0.75, 1.1, P.earth, true, 5);
  shardA.rotation.set(Math.PI, 1.2, 0.35);
  shardA.position.set(0.6, -1.0, 0.25);
  const shardB = cone(0.55, 0.85, P.slate, true, 5);
  shardB.rotation.set(Math.PI, -0.7, -0.4);
  shardB.position.set(-0.65, -0.9, -0.2);
  peak.add(shardA, shardB);
  const collar = cyl(1.5, 1.66, 0.42, P.pine);
  collar.position.y = -0.26;
  const lawn = cyl(1.38, 1.52, 0.2, P.leaf);
  lawn.position.y = 0.05;
  peak.add(rock, collar, lawn);
  for (let i = 0; i < 4; i += 1) {
    const tuft = sphere(0.15, P.leaf, true, 10);
    tuft.position.set(Math.cos(i * 2.3) * 1.12, 0.18, Math.sin(i * 2.3) * 1.0);
    tuft.scale.y = 0.6;
    peak.add(tuft);
  }
  d.prop(peak, { delay: 0, span: 0.45, drop: 0.8, idle: bob(0.06, 0.7) });

  // The crystal keel — the thing that keeps the island up. It rides the
  // island bob so the air gap under the lowest tip never breathes, and
  // pulses quieter than the machine core so the two don't compete.
  const keel = octa(0.18, P.gold);
  keel.position.set(0, -2.38, 0.45);
  d.prop(keel, {
    delay: 0.12,
    span: 0.35,
    drop: 0.4,
    idle: (o, t, b) => {
      o.position.y = b.py + isleBob(t);
      o.rotation.y = t * 0.45;
      const s = 1 + Math.sin(t * 1.3) * 0.1;
      o.scale.set(b.sx * s, b.sy * s, b.sz * s);
    },
  });

  // Loose rock bits where gravity gave up — each on its own bob phase.
  const DEBRIS = [
    [1.25, -1.9, 0.3, 0.13, 0],
    [-1.1, -1.85, -0.2, 0.11, 2.1],
    [-0.85, -2.15, 0.8, 0.09, 4.3],
  ];
  const debris = new Group();
  DEBRIS.forEach(([x, y, z, r], i) => {
    const bit = octa(r, i === 1 ? P.slate : P.earth);
    bit.position.set(x, y, z);
    debris.add(bit);
  });
  d.prop(debris, {
    delay: 0.16,
    span: 0.35,
    drop: 0.5,
    idle: (o, t) => {
      DEBRIS.forEach(([, y, , , phase], i) => {
        const bit = o.children[i];
        bit.position.y = y + Math.sin(t * 0.5 + phase) * 0.12;
        bit.rotation.y = t * 0.3 + phase;
      });
      o.position.y = isleBob(t);
    },
  });

  // The workshop machine: rice shell, vermillion roof lip, a porthole
  // showing the core, a chimney, and a gold delivery spout on the right.
  const body = new Group();
  const shell = box(1.15, 0.85, 0.8, P.rice);
  const lip = box(1.3, 0.13, 0.92, P.vermillion);
  lip.position.y = 0.49;
  const ring = cyl(0.26, 0.26, 0.08, P.slate, true, 18);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(-0.28, 0.05, 0.38);
  const chimney = cyl(0.09, 0.12, 0.34, P.slate, true, 12);
  chimney.position.set(0.38, 0.62, -0.15);
  const spoutTube = cyl(0.14, 0.14, 0.5, P.gold);
  spoutTube.rotation.z = Math.PI / 2;
  spoutTube.position.set(0.8, 0.04, 0);
  const spoutRim = cyl(0.17, 0.17, 0.1, P.gold);
  spoutRim.rotation.z = Math.PI / 2;
  spoutRim.position.set(1.08, 0.04, 0);
  body.add(shell, lip, ring, chimney, spoutTube, spoutRim);
  body.position.set(0.18, 0.58, -0.1);
  d.prop(body, { delay: 0.18, span: 0.45, drop: 0.6, idle: bob(0.06, 0.7) });

  // Intake funnel above the left shoulder — raw blocks drop straight in.
  const funnel = new Group();
  const mouth = cyl(0.46, 0.16, 0.45, P.jade);
  const neck = cyl(0.1, 0.1, 0.32, P.jade);
  neck.position.y = -0.36;
  funnel.add(mouth, neck);
  funnel.position.set(-0.32, 1.42, -0.1);
  d.prop(funnel, { delay: 0.3, span: 0.4, drop: 0.5, idle: bob(0.06, 0.7) });

  // Two face gears, counter-rotating; a rim bolt makes the spin legible.
  const gears = new Group();
  const gearAt = (x, y, r) => {
    const g = new Group();
    const disc = cyl(r, r, 0.09, P.gold, true, 8);
    disc.rotation.x = Math.PI / 2;
    const bolt = box(0.05, 0.05, 0.04, P.slate, false);
    bolt.position.set(0, r * 0.6, 0.07);
    g.add(disc, bolt);
    g.position.set(x, y, 0.34);
    gears.add(g);
  };
  gearAt(0.42, 0.74, 0.2);
  gearAt(0.7, 0.47, 0.15);
  d.prop(gears, {
    delay: 0.42,
    span: 0.35,
    drop: 0.3,
    idle: (o, t, b) => {
      o.position.y = b.py + isleBob(t);
      o.children[0].rotation.z = t * 1.1;
      o.children[1].rotation.z = -t * 1.5 + 0.3;
    },
  });

  // The glowing core in the porthole — the machine's pulse.
  const core = octa(0.16, P.gold);
  core.position.set(-0.1, 0.63, 0.33);
  d.prop(core, {
    delay: 0.48,
    span: 0.3,
    drop: 0.2,
    idle: (o, t, b) => {
      o.position.y = b.py + isleBob(t);
      o.rotation.y = t * 1.4;
      const s = 1 + Math.sin(t * 2.2) * 0.16;
      o.scale.set(b.sx * s, b.sy * s, b.sz * s);
    },
  });

  // Chimney steam: one puff on a rising shrink-out loop (toon materials are
  // shared, so loops shrink instead of fading).
  const steam = cloud(0.16);
  steam.position.set(0.56, 1.5, -0.25);
  d.prop(steam, {
    delay: 0.58,
    span: 0.3,
    drop: 0.2,
    idle: (o, t, b) => {
      const u = (t * 0.25) % 1;
      o.position.y = b.py + u * 0.5 + isleBob(t);
      o.scale.setScalar(b.sx * (0.7 + u * 0.6) * Math.min(1, (1 - u) * 4));
    },
  });

  // Raw blocks falling into the funnel — unshaped problems, dropping in.
  for (let i = 0; i < 3; i += 1) {
    const cube = box(0.2, 0.2, 0.2, i % 2 ? P.earth : P.slate);
    cube.position.set(-0.32, 2.0 + i * 0.35, -0.1);
    d.prop(cube, {
      delay: 0.62 + i * 0.04,
      span: 0.3,
      drop: 0.2,
      idle: (o, t, b) => {
        const u = (t * 0.22 + i / 3) % 1;
        o.position.set(-0.32 + Math.sin(i * 9 + u * 2) * 0.1, 2.6 - u * 1.05 + isleBob(t), -0.1);
        o.rotation.set(t * 0.8 + i, u * 3, 0);
        o.scale.setScalar(b.sx * Math.min(1, u * 6, (1 - u) * 5));
      },
    });
  }

  // Finished artifacts drifting out of the spout and up past the sun — each
  // one a miniature of a chapter below: robot (AI), phone (mobile),
  // database (data), browser (web). The machine builds the whole page.
  const miniBot = new Group();
  const skull = box(0.3, 0.24, 0.22, P.rice);
  const face = box(0.22, 0.13, 0.03, P.ink, false);
  face.position.set(0, -0.01, 0.12);
  const antenna = cyl(0.015, 0.015, 0.12, P.slate, false, 6);
  antenna.position.y = 0.16;
  const antennaTip = sphere(0.05, P.vermillion, false, 10);
  antennaTip.position.y = 0.24;
  miniBot.add(skull, face, antenna, antennaTip);

  const miniDb = new Group();
  for (let k = 0; k < 3; k += 1) {
    const disc = cyl(0.16, 0.16, 0.09, P.jade, true, 16);
    disc.position.y = k * 0.13 - 0.13;
    miniDb.add(disc);
  }

  const miniBrowser = new Group();
  const pane = box(0.42, 0.32, 0.05, P.white);
  const bar = box(0.42, 0.07, 0.06, P.vermillion, false);
  bar.position.set(0, 0.125, 0.005);
  const rowA = box(0.3, 0.04, 0.02, P.azure, false);
  rowA.position.set(0, 0.02, 0.035);
  const rowB = box(0.22, 0.04, 0.02, P.jade, false);
  rowB.position.set(-0.04, -0.07, 0.035);
  miniBrowser.add(pane, bar, rowA, rowB);

  [miniBot, phone(0.26, 0.5, P.azure), miniDb, miniBrowser].forEach((a, i) => {
    a.position.set(1.35 + i * 0.12, 0.62 + i * 0.55, -0.1);
    d.prop(a, {
      delay: 0.66 + i * 0.04,
      span: 0.3,
      drop: 0.2,
      idle: (o, t, b) => {
        const u = (t * 0.09 + i * 0.25) % 1;
        const rise = Math.max(0, (u - 0.12) / 0.88);
        o.position.set(
          1.32 + rise * (0.3 + (i % 2) * 0.25) + Math.sin(rise * 4 + i * 2.1) * 0.15,
          0.62 + rise * 1.7 + isleBob(t),
          -0.1 + Math.sin(i * 3.7) * 0.25,
        );
        o.rotation.y = t * 0.5 + i;
        o.scale.setScalar(b.sx * Math.min(1, u * 7, (1 - u) * 5));
      },
    });
  });

  const pine = new Group();
  const trunk = cyl(0.06, 0.09, 0.4, P.earth, false, 10);
  const tierA = cone(0.4, 0.55, P.pine);
  tierA.position.y = 0.42;
  const tierB = cone(0.27, 0.4, P.pine);
  tierB.position.y = 0.8;
  pine.add(trunk, tierA, tierB);
  pine.position.set(-1.08, 0.35, -0.3);
  d.prop(pine, { delay: 0.38, span: 0.4, drop: 0.5, idle: bob(0.06, 0.7) });

  const lamp = lantern(0.55);
  lamp.position.set(-0.98, 0.95, 0.32);
  d.prop(lamp, { delay: 0.5, span: 0.35, drop: 0.4, idle: bob(0.07, 1.1, 2.3) });

  const sun = new Group();
  sun.add(sphere(0.4, P.gold));
  for (let i = 0; i < 8; i += 1) {
    const ray = cone(0.07, 0.26, P.gold, false);
    const a = (i / 8) * Math.PI * 2;
    ray.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0);
    ray.rotation.z = a - Math.PI / 2;
    sun.add(ray);
  }
  sun.position.set(1.85, 2.5, -0.8);
  d.prop(sun, { delay: 0.45, span: 0.4, drop: 0.3, idle: spin(0.25, 'z') });

  // The cloud sea the peak floats above — flattened puffs hugging the rock.
  const seaSpots = [
    [-1.75, -1.15, 0.5, 1.0, 0.4],
    [1.65, -1.45, 0.4, 0.85, 1.9],
    [-1.3, -2.0, 0.7, 0.7, 3.3],
    [1.0, -2.1, -0.3, 0.6, 5.1],
  ];
  seaSpots.forEach(([x, y, z, s, phase], i) => {
    const puff = cloud(s);
    puff.scale.y = s * 0.55;
    puff.position.set(x, y, z);
    d.prop(puff, { delay: 0.55 + i * 0.07, span: 0.4, drop: 0.25, idle: bob(0.04, 0.5, phase) });
  });

  const cloudA = cloud(0.8);
  cloudA.position.set(-1.95, 1.7, -0.6);
  d.prop(cloudA, { delay: 0.62, span: 0.4, drop: 0.25, idle: bob(0.05, 0.55, 1.7) });
  const cloudB = cloud(0.55);
  cloudB.position.set(1.05, 2.85, 0.3);
  d.prop(cloudB, { delay: 0.7, span: 0.35, drop: 0.25, idle: bob(0.05, 0.7, 4.1) });

  // Qi wisps circling the whole summit.
  const wisps = new Group();
  for (let i = 0; i < 5; i += 1) {
    const w = octa(0.12, i % 2 ? P.jade : P.gold);
    const a = (i / 5) * Math.PI * 2;
    w.position.set(Math.cos(a) * 2.15, 0.45 + Math.sin(a * 2) * 0.7, Math.sin(a) * 1.4);
    wisps.add(w);
  }
  d.prop(wisps, { delay: 0.78, span: 0.4, drop: 0.3, idle: spin(0.3) });

  return d;
}

// 06 · origins — the sparsest set on the page, on purpose: a stack of
// borrowed books, one small lantern lit above them, the palm, a single
// sparkle. The emptiness is the design — everything above was climbed
// from here.
export function buildOrigins() {
  const d = new Diorama();
  d.prop(blobShadow(1.7, -1.6), { delay: 0, span: 0.3, drop: 0 });

  const colors = [P.earth, P.rice, P.slate, P.earth];
  colors.forEach((c, i) => {
    const b = box(1.65 - i * 0.12, 0.26, 1.05, c);
    b.position.y = -1.25 + i * 0.27;
    b.rotation.y = (i % 2 ? -1 : 1) * (0.12 + i * 0.05);
    d.prop(b, { delay: 0.05 + i * 0.08, span: 0.35, drop: 0.5 });
  });

  const spark = lantern(0.5);
  spark.position.set(0.1, 0.55, 0);
  d.prop(spark, { delay: 0.42, span: 0.4, drop: 0.45, idle: bob(0.08, 0.9) });

  const tree = palm(0.8);
  tree.position.set(-1.7, -1.55, -0.5);
  d.prop(tree, { delay: 0.55, span: 0.35, drop: 0.4, idle: sway(0.05, 0.8, 2) });

  const sparkle = octa(0.14, P.gold);
  sparkle.position.set(1.45, 0.6, 0.2);
  d.prop(sparkle, { delay: 0.7, span: 0.3, drop: 0.2, idle: spin(0.9) });

  return d;
}

// 05 · edstem — the apprentice years: an open scroll, messages still
// circling it. Fewer pieces than the chapters above — the gradient at work.
export function buildEdstem() {
  const d = new Diorama();
  d.prop(blobShadow(1.6, -1.8), { delay: 0, span: 0.3, drop: 0 });

  const sc = scrollProp(1.15, [
    [0.95, 0.14, P.slate, -0.12, 0.3],
    [0.7, 0.13, P.jade, 0.08, 0.02],
    [0.88, 0.13, P.slate, -0.08, -0.28],
  ]);
  sc.position.y = -0.35;
  sc.rotation.y = -0.14;
  sc.rotation.z = 0.04;
  d.prop(sc, { delay: 0.05, span: 0.45, drop: 0.7, idle: bob(0.05, 0.8) });

  const orbit = new Group();
  const colors = [P.jade, P.white, P.gold];
  for (let i = 0; i < 3; i += 1) {
    const b = chatBubble(colors[i]);
    const a = (i / 3) * Math.PI * 2;
    b.position.set(Math.cos(a) * 1.5, 0.25 + Math.sin(a * 2) * 0.45, Math.sin(a) * 1.0);
    b.rotation.y = -a * 0.4;
    orbit.add(b);
  }
  orbit.position.y = -0.2;
  d.prop(orbit, { delay: 0.45, span: 0.45, drop: 0.4, idle: spin(0.35) });

  return d;
}

// 04 · psctalks — a three-tier pagoda, lanterns rising past it like the
// download counter on its way to half a million.
export function buildPsctalks() {
  const d = new Diorama();
  d.prop(blobShadow(1.7, -2.0), { delay: 0, span: 0.3, drop: 0 });

  const pagoda = new Group();
  const plinth = cyl(1.0, 1.12, 0.22, P.earth);
  plinth.position.y = -1.55;
  pagoda.add(plinth);
  for (let i = 0; i < 3; i += 1) {
    const body = cyl(0.6 - i * 0.12, 0.66 - i * 0.12, 0.55, P.rice);
    body.position.y = -1.17 + i * 0.93;
    const eave = cone(1.02 - i * 0.2, 0.42, P.vermillion);
    eave.position.y = -0.76 + i * 0.93;
    pagoda.add(body, eave);
  }
  const rod = cyl(0.04, 0.04, 0.38, P.gold, false, 8);
  rod.position.y = 1.28;
  const finial = octa(0.11, P.gold);
  finial.position.y = 1.52;
  pagoda.add(rod, finial);
  d.prop(pagoda, { delay: 0.05, span: 0.5, drop: 0.8, idle: bob(0.03, 0.6) });

  // One lantern hung from the middle eave…
  const hung = lantern(0.38);
  hung.position.set(1.0, -0.1, 0.3);
  d.prop(hung, { delay: 0.5, span: 0.35, drop: 0.3, idle: sway(0.08, 1.2, 1.1) });

  // …and two loose ones drifting upward — the count, rising.
  const drifters = [
    [-1.5, -0.55, 0.3, 0],
    [1.45, 0.7, -0.3, 2.4],
  ];
  drifters.forEach(([x, y, z, phase], i) => {
    const lamp = lantern(0.45);
    lamp.position.set(x, y, z);
    d.prop(lamp, { delay: 0.6 + i * 0.12, span: 0.35, drop: 0.35, idle: bob(0.28, 0.5, phase) });
  });

  return d;
}

// 03 · willhire — two robed figures meet under a gold bridge; five months
// later, one name.
export function buildWillhire() {
  const d = new Diorama();
  d.prop(blobShadow(1.2, -1.6).translateX(-1.05), { delay: 0, span: 0.3, drop: 0 });
  d.prop(blobShadow(1.2, -1.6).translateX(1.05), { delay: 0.08, span: 0.3, drop: 0 });

  const blobA = new Group();
  const bodyA = sphere(0.8, P.vermillion);
  bodyA.scale.y = 0.92;
  const faceA = eyes(0.26, 0.12);
  faceA.position.set(0.18, 0.18, 0.68);
  const hatA = cone(0.62, 0.34, P.rice);
  hatA.position.set(0.05, 0.78, 0.05);
  hatA.rotation.z = -0.08;
  blobA.add(bodyA, faceA, hatA);
  blobA.position.set(-1.05, -0.7, 0);
  d.prop(blobA, { delay: 0.05, span: 0.4, drop: 0.6, idle: bob(0.06, 1.1) });

  const blobB = new Group();
  const bodyB = sphere(0.62, P.jade);
  const faceB = eyes(0.22, 0.1);
  faceB.position.set(-0.14, 0.14, 0.52);
  const hatB = cone(0.5, 0.28, P.rice);
  hatB.position.set(-0.04, 0.6, 0.04);
  hatB.rotation.z = 0.1;
  blobB.add(bodyB, faceB, hatB);
  blobB.position.set(1.1, -0.82, 0);
  d.prop(blobB, { delay: 0.18, span: 0.4, drop: 0.6, idle: bob(0.06, 1.1, Math.PI) });

  const bridge = torus(1.08, 0.07, P.gold, Math.PI);
  bridge.position.y = -0.55;
  d.prop(bridge, { delay: 0.5, span: 0.4, drop: 0.3 });

  // A thin gold token spinning where the two paths cross.
  const token = octa(0.2, P.gold);
  token.position.set(0, 0.85, 0);
  token.scale.z = 0.45;
  d.prop(token, { delay: 0.72, span: 0.28, drop: 0.3, idle: (o, t, b) => {
    o.rotation.y = t * 0.8;
    const s = 1 + Math.sin(t * 2.4) * 0.12;
    o.scale.set(b.sx * s, b.sy * s, b.sz * s);
  } });

  return d;
}

// 02 · magnit — the pipe machine: Oracle in, Postgres out, live the whole time.
export function buildMagnitData() {
  const d = new Diorama();
  d.prop(blobShadow(2.2, -1.9), { delay: 0, span: 0.3, drop: 0 });

  const funnel = new Group();
  const mouth = cyl(0.85, 0.3, 0.8, P.jade);
  const neck = cyl(0.16, 0.16, 0.5, P.jade);
  neck.position.y = -0.6;
  funnel.add(mouth, neck);
  funnel.position.set(-1.45, 0.95, 0);
  d.prop(funnel, { delay: 0.05, span: 0.4, drop: 0.5 });

  const pipe = new Group();
  const elbow = torus(0.42, 0.17, P.azure, Math.PI / 2);
  elbow.rotation.z = Math.PI;
  elbow.position.set(-1.03, 0.12, 0);
  const run = cyl(0.17, 0.17, 1.9, P.azure);
  run.rotation.z = Math.PI / 2;
  run.position.set(0, -0.3, 0);
  // Outlet curves DOWN into the pool: a 0..90° torus quarter has a horizontal
  // tangent at its top and a vertical one at its right — no rotation needed.
  const outlet = torus(0.42, 0.17, P.azure, Math.PI / 2);
  outlet.position.set(0.95, -0.72, 0);
  const spout = cyl(0.17, 0.17, 0.45, P.azure);
  spout.position.set(1.37, -0.95, 0);
  pipe.add(elbow, run, outlet, spout);
  d.prop(pipe, { delay: 0.25, span: 0.45, drop: 0.4 });

  const pool = new Group();
  pool.add(cyl(0.85, 0.7, 0.5, P.azure));
  for (let i = 0; i < 3; i += 1) {
    const cube = box(0.26, 0.26, 0.26, [P.gold, P.vermillion, P.jade][i], false);
    cube.position.set(Math.cos(i * 2.6) * 0.35, 0.33, Math.sin(i * 2.6) * 0.3);
    cube.rotation.y = i;
    pool.add(cube);
  }
  pool.position.set(1.37, -1.5, 0);
  d.prop(pool, { delay: 0.45, span: 0.4, drop: 0.4 });

  // Spirit stones riding the pipeline — a deterministic loop along the path.
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
    const stone = octa(0.15, [P.gold, P.vermillion, P.jade, P.gold][i]);
    d.prop(stone, { delay: 0.6 + i * 0.06, span: 0.3, drop: 0.2, idle: (o, t, b) => {
      const u = (t * 0.12 + i * 0.25) % 1;
      const [x, y, z] = path(u);
      o.position.set(x, y, z);
      o.rotation.y = b.ry + t * 1.2;
      o.rotation.z = b.rz + t * 0.7;
    } });
  }

  return d;
}

// 01 · maggi — a friendly spirit-companion robot, wisps in orbit.
export function buildMaggi() {
  const d = new Diorama();
  d.prop(blobShadow(1.6, -1.7), { delay: 0, span: 0.3, drop: 0 });

  const head = new Group();
  const skull = box(1.55, 1.25, 1.2, P.rice);
  const face = box(1.2, 0.8, 0.08, P.ink, false);
  face.position.set(0, -0.02, 0.62);
  // A blank paper tag draped over the forehead — a talisman with nothing
  // written on it (no glyphs anywhere on this site, by design).
  const tag = box(0.3, 0.46, 0.03, P.white);
  tag.position.set(0.32, 0.48, 0.68);
  tag.rotation.x = -0.06;
  tag.rotation.z = 0.05;
  head.add(tag);
  const eyeL = capsule(0.09, 0.12, P.jade);
  eyeL.position.set(-0.3, 0.05, 0.7);
  const eyeR = capsule(0.09, 0.12, P.jade);
  eyeR.position.set(0.3, 0.05, 0.7);
  const mouth = box(0.34, 0.07, 0.04, P.jade, false);
  mouth.position.set(0, -0.3, 0.7);
  for (const side of [-1, 1]) {
    const ear = cyl(0.12, 0.12, 0.18, P.vermillion);
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
  const tip = sphere(0.14, P.vermillion);
  tip.position.y = 0.32;
  antenna.add(rod, tip);
  antenna.position.set(0, 0.35, 0);
  d.prop(antenna, { delay: 0.4, span: 0.35, drop: 0.3, idle: sway(0.12, 1.6) });

  const orbit = new Group();
  const sparkColors = [P.jade, P.gold, P.jade, P.gold];
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

// 07 · projects — the artifact shelf: three ceremonial podiums, a gold
// relic hovering over the tallest.
export function buildProjects() {
  const d = new Diorama();
  d.prop(blobShadow(2.0, -1.75), { delay: 0, span: 0.3, drop: 0 });

  const podiums = [
    [-1.05, 0.7, P.vermillion],
    [0, 1.1, P.gold],
    [1.05, 0.5, P.jade],
  ];
  podiums.forEach(([x, h, c], i) => {
    const p = box(0.92, h, 0.92, c);
    p.position.set(x, -1.7 + h / 2, 0);
    d.prop(p, { delay: 0.05 + i * 0.1, span: 0.35, drop: 0.5 });
  });

  const artifact = octa(0.32, P.gold);
  artifact.position.set(0, -0.14, 0);
  d.prop(artifact, { delay: 0.4, span: 0.4, drop: 0.5, idle: (o, t) => {
    o.rotation.y = t * 0.6;
    o.position.y = -0.14 + Math.sin(t * 0.9) * 0.09;
  } });

  const miniPhone = phone(0.42, 0.8, P.plum);
  miniPhone.position.set(-1.05, -0.92, 0);
  miniPhone.rotation.y = 0.25;
  d.prop(miniPhone, { delay: 0.55, span: 0.35, drop: 0.4 });

  const manga = box(0.5, 0.66, 0.12, P.plum);
  manga.position.set(1.05, -1.08, 0);
  manga.rotation.y = -0.3;
  d.prop(manga, { delay: 0.65, span: 0.35, drop: 0.4 });

  return d;
}

// 08 · contact — a paper crane circling the mountain gate, a message
// scroll left at the threshold.
export function buildContact() {
  const d = new Diorama();
  d.prop(blobShadow(1.5, -1.8), { delay: 0, span: 0.3, drop: 0 });

  const arch = gate(0.85);
  arch.position.y = -1.75;
  d.prop(arch, { delay: 0.05, span: 0.45, drop: 0.7, idle: sway(0.012, 0.8) });

  const message = scrollProp(0.32);
  message.position.set(-0.85, -1.62, 0.45);
  message.rotation.set(-0.25, 0.4, 0.06);
  d.prop(message, { delay: 0.5, span: 0.35, drop: 0.3 });

  const crane = new Group();
  const dart = cone(0.2, 0.72, P.white, true, 4);
  dart.rotation.x = Math.PI / 2;
  dart.scale.set(1, 1, 0.45);
  crane.add(dart);
  for (const side of [-1, 1]) {
    const wing = cone(0.36, 0.05, P.white, true, 3);
    wing.position.set(side * 0.3, 0.08, -0.05);
    wing.rotation.set(0.15, side * 0.5, side * 0.55);
    crane.add(wing);
  }
  const head = cone(0.06, 0.16, P.vermillion, false, 8);
  head.position.set(0, 0.06, 0.42);
  head.rotation.x = 1.1;
  crane.add(head);
  d.prop(crane, { delay: 0.6, span: 0.4, drop: 0.3, idle: (o, t) => {
    const a = t * 0.55;
    const r = 1.55;
    o.position.set(Math.cos(a) * r, 0.7 + Math.sin(t * 0.9) * 0.35, Math.sin(a) * r * 0.7);
    // face the direction of travel
    o.rotation.y = -a;
    o.rotation.z = Math.sin(t * 0.9) * 0.25;
  } });

  return d;
}

// Descent order — the story reads backwards, from the summit down.
export const BUILDERS = [
  buildHero,
  buildMaggi,
  buildMagnitData,
  buildWillhire,
  buildPsctalks,
  buildEdstem,
  buildOrigins,
  buildProjects,
  buildContact,
];
