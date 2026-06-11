uniform vec3 uColorA;   // scroll-driven accent (matches the CSS --accent)
uniform vec3 uColorB;   // cool neutral
uniform float uOpacity;

varying float vMix;
varying float vFade;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = 1.0 - smoothstep(0.1, 0.5, d);
  if (disc < 0.001) discard;

  vec3 col = mix(uColorB, uColorA, 0.2 + 0.8 * vMix);
  float alpha = disc * uOpacity * vFade;
  gl_FragColor = vec4(col * alpha, alpha);
}
