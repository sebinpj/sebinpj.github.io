// Procedural particle layouts, one per story chapter. Each fills n RGBA
// texels: xyz = rest position, w = wave amplitude (the ocean breathes hard,
// everything else barely). All deterministic — layouts are identical on
// every load and every scrub direction.

import { seededRandom } from '../../utils/math.js';

const TAU = Math.PI * 2;

function gaussian(rand) {
  // Box–Muller
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rand());
}

/* 00 — signal in the noise: a loose breathing cloud */
function chaos(n, out) {
  const rand = seededRandom(101);
  for (let i = 0; i < n; i++) {
    out[i * 4 + 0] = gaussian(rand) * 1.7;
    out[i * 4 + 1] = gaussian(rand) * 1.3;
    out[i * 4 + 2] = gaussian(rand) * 1.7;
    out[i * 4 + 3] = 0.05 + rand() * 0.05;
  }
}

/* 01 — learning imposes structure: a precise lattice */
function lattice(n, out) {
  const rand = seededRandom(202);
  const side = Math.ceil(Math.cbrt(n));
  const spacing = 5.6 / side;
  for (let i = 0; i < n; i++) {
    const x = i % side;
    const y = Math.floor(i / side) % side;
    const z = Math.floor(i / (side * side));
    out[i * 4 + 0] = (x - side / 2) * spacing + (rand() - 0.5) * 0.04;
    out[i * 4 + 1] = (y - side / 2) * spacing * 0.75 + (rand() - 0.5) * 0.04;
    out[i * 4 + 2] = (z - side / 2) * spacing + (rand() - 0.5) * 0.04;
    out[i * 4 + 3] = 0.02;
  }
}

/* 02 — messages in motion: braided streams */
function streams(n, out) {
  const rand = seededRandom(303);
  const STRANDS = 6;
  for (let i = 0; i < n; i++) {
    const s = i % STRANDS;
    const t = rand() * 2 - 1; // -1..1 along the braid
    const x = t * 5.4;
    const phase = s * 1.07;
    out[i * 4 + 0] = x;
    out[i * 4 + 1] = Math.sin(x * 0.85 + phase * 2.2) * 1.25 + (s - STRANDS / 2) * 0.22 + gaussian(rand) * 0.07;
    out[i * 4 + 2] = Math.cos(x * 0.65 + phase) * 0.9 + gaussian(rand) * 0.07;
    out[i * 4 + 3] = 0.06 + rand() * 0.04;
  }
}

/* 03 — the app: a monolith slab with downloads raining upward into it */
function monolith(n, out) {
  const rand = seededRandom(404);
  const W = 2.1, H = 4.0, D = 0.36;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (rand() < 0.82) {
      // shell of the slab
      const face = rand();
      const x = (rand() - 0.5) * W;
      const y = (rand() - 0.5) * H;
      if (face < 0.75) {
        out[o] = x; out[o + 1] = y; out[o + 2] = (rand() < 0.5 ? -1 : 1) * D / 2;
      } else if (face < 0.9) {
        out[o] = (rand() < 0.5 ? -1 : 1) * W / 2; out[o + 1] = y; out[o + 2] = (rand() - 0.5) * D;
      } else {
        out[o] = x; out[o + 1] = (rand() < 0.5 ? -1 : 1) * H / 2; out[o + 2] = (rand() - 0.5) * D;
      }
      out[o + 3] = 0.025;
    } else {
      // ascending rain
      out[o] = (rand() - 0.5) * 4.4;
      out[o + 1] = -3.4 + rand() * 6.8;
      out[o + 2] = -0.6 - rand() * 2.4;
      out[o + 3] = 0.1 + rand() * 0.1;
    }
  }
}

/* 04 — acquisition: two bodies and the bridge between them */
function merge(n, out) {
  const rand = seededRandom(505);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const pick = rand();
    if (pick < 0.44) {
      out[o] = -1.95 + gaussian(rand) * 0.62;
      out[o + 1] = gaussian(rand) * 0.62;
      out[o + 2] = gaussian(rand) * 0.62;
    } else if (pick < 0.88) {
      out[o] = 1.95 + gaussian(rand) * 0.62;
      out[o + 1] = gaussian(rand) * 0.62;
      out[o + 2] = gaussian(rand) * 0.62;
    } else {
      // filament
      const t = rand();
      out[o] = -1.95 + t * 3.9;
      out[o + 1] = Math.sin(t * Math.PI) * (rand() - 0.5) * 0.5;
      out[o + 2] = (rand() - 0.5) * 0.3;
    }
    out[o + 3] = 0.05;
  }
}

/* 05 — the data ocean: a wide undulating sheet (waves animate in-shader) */
function ocean(n, out) {
  const rand = seededRandom(606);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    out[o] = (rand() - 0.5) * 11.5;
    out[o + 1] = -2.3 + gaussian(rand) * 0.06;
    out[o + 2] = (rand() - 0.5) * 8.0;
    out[o + 3] = 0.22 + rand() * 0.22;
  }
}

/* 06 — the model: clustered embeddings, a thinking constellation */
function constellation(n, out) {
  const rand = seededRandom(707);
  const K = 13;
  const centers = [];
  for (let k = 0; k < K; k++) {
    centers.push([gaussian(rand) * 1.5, gaussian(rand) * 1.1, gaussian(rand) * 1.5]);
  }
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (rand() < 0.85) {
      const c = centers[(rand() * K) | 0];
      out[o] = c[0] + gaussian(rand) * 0.34;
      out[o + 1] = c[1] + gaussian(rand) * 0.34;
      out[o + 2] = c[2] + gaussian(rand) * 0.34;
    } else {
      // sparse dust shell
      const r = 3.4 + rand() * 0.9;
      const th = rand() * TAU;
      const ph = Math.acos(rand() * 2 - 1);
      out[o] = r * Math.sin(ph) * Math.cos(th);
      out[o + 1] = r * Math.cos(ph) * 0.7;
      out[o + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    out[o + 3] = 0.05;
  }
}

/* 07 — shipped work: the constellation widens into a connected network */
function network(n, out) {
  const rand = seededRandom(808);
  const K = 9;
  const centers = [];
  for (let k = 0; k < K; k++) {
    centers.push([gaussian(rand) * 2.4, gaussian(rand) * 1.6, gaussian(rand) * 2.4]);
  }
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (rand() < 0.62) {
      const c = centers[(rand() * K) | 0];
      out[o] = c[0] + gaussian(rand) * 0.3;
      out[o + 1] = c[1] + gaussian(rand) * 0.3;
      out[o + 2] = c[2] + gaussian(rand) * 0.3;
    } else {
      // arcs between random center pairs
      const a = centers[(rand() * K) | 0];
      const b = centers[(rand() * K) | 0];
      const t = rand();
      const lift = Math.sin(t * Math.PI) * 0.8;
      out[o] = a[0] + (b[0] - a[0]) * t + (rand() - 0.5) * 0.1;
      out[o + 1] = a[1] + (b[1] - a[1]) * t + lift + (rand() - 0.5) * 0.1;
      out[o + 2] = a[2] + (b[2] - a[2]) * t + (rand() - 0.5) * 0.1;
    }
    out[o + 3] = 0.04;
  }
}

/* 08 — signal: a calm precessing halo */
function ring(n, out) {
  const rand = seededRandom(909);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const th = rand() * TAU;
    const tube = Math.abs(gaussian(rand)) * 0.16 + (rand() < 0.12 ? rand() * 0.8 : 0);
    const ph = rand() * TAU;
    const R = 2.75;
    out[o] = (R + tube * Math.cos(ph)) * Math.cos(th);
    out[o + 1] = tube * Math.sin(ph) + Math.sin(th * 2) * 0.12;
    out[o + 2] = (R + tube * Math.cos(ph)) * Math.sin(th);
    out[o + 3] = 0.05;
  }
}

export const SHAPES = [chaos, lattice, streams, monolith, merge, ocean, constellation, network, ring];

export function generateShapeTexels(n) {
  return SHAPES.map((make) => {
    const data = new Float32Array(n * 4);
    make(n, data);
    return data;
  });
}
