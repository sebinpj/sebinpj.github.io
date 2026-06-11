// Particle positions live in float DataTextures, one per story chapter.
// The mesh itself carries no positions — only a texture reference and a seed.
// Morphing is a staggered, curl-perturbed lerp between two chapter textures,
// fully deterministic so scroll can scrub it forwards and backwards.

uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uProgress;     // 0..1 between chapter forms
uniform float uTime;
uniform float uTurbulence;   // idle drift strength
uniform float uSize;
uniform float uPixelRatio;
uniform vec3 uPointer;       // world-space cursor for local repulsion
uniform float uPointerForce;

attribute vec2 aRef;         // uv into the chapter textures
attribute vec4 aRand;        // per-particle seeds

varying float vMix;
varying float vFade;

#include ./noise.glsl

void main() {
  vec4 a = texture2D(uTexA, aRef);
  vec4 b = texture2D(uTexB, aRef);

  // Staggered progress: each particle departs on its own schedule.
  const float STAGGER = 0.65;
  float p = clamp(uProgress * (1.0 + STAGGER) - aRand.x * STAGGER, 0.0, 1.0);
  p = p * p * (3.0 - 2.0 * p);

  vec3 pos = mix(a.xyz, b.xyz, p);

  // Per-particle wave amplitude rides in the texture's w channel
  // (large for the ocean form, a faint breathing elsewhere).
  float amp = mix(a.w, b.w, p);
  pos.y += sin(uTime * 0.9 + pos.x * 0.85 + pos.z * 0.6 + aRand.z * 6.2831) * amp;

  // Swirl apart mid-morph, settle at rest.
  float turb = uTurbulence + sin(p * 3.14159) * 1.5;
  pos += curlNoise(pos * 0.32 + uTime * 0.045) * turb * (0.35 + aRand.y * 0.65);

  // Cursor repulsion (driven up only where it earns its keep).
  vec3 away = pos - uPointer;
  pos += normalize(away + 1e-4) * uPointerForce * (1.0 - smoothstep(0.0, 2.2, length(away)));

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  // Mostly fine dust with a sprinkling of larger glow motes.
  float mote = 1.0 + step(0.97, aRand.w) * 2.5;
  gl_PointSize = uSize * uPixelRatio * (0.5 + aRand.w * 1.0) * mote * (8.5 / -mv.z);

  vMix = aRand.y;
  vFade = 1.0 - smoothstep(7.0, 30.0, -mv.z);
}
