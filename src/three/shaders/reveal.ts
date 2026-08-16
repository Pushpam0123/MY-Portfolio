export const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  precision highp float;

  uniform sampler2D uBase;
  uniform sampler2D uReveal;
  uniform vec2  uPointer;
  uniform float uActive;
  uniform float uTime;
  uniform float uRadius;
  uniform float uAspect;

  varying vec2 vUv;

  void main() {
    vec2 aspect = vec2(uAspect, 1.0);
    vec2 toPointer = (vUv - uPointer) * aspect;
    float dist = length(toPointer);

    float wave = sin(dist * 34.0 - uTime * 4.2) * 0.5 + 0.5;
    float falloff = smoothstep(uRadius, 0.0, dist);
    float ripple = wave * falloff * uActive;

    vec2 dir = dist > 0.0001 ? normalize(toPointer) : vec2(0.0);
    vec2 offset = dir * ripple * 0.018;
    vec2 uvBase = clamp(vUv + offset * 0.35, 0.0, 1.0);
    vec2 uvReveal = clamp(vUv - offset, 0.0, 1.0);

    vec4 base = texture2D(uBase, uvBase);
    vec4 reveal = texture2D(uReveal, uvReveal);

    float edge = uRadius * (0.62 + ripple * 0.3);
    float mask = smoothstep(edge, edge * 0.35, dist) * uActive;

    vec4 color = mix(base, reveal, mask);

    float rim = smoothstep(0.0, 0.35, mask) * smoothstep(1.0, 0.55, mask);
    color.rgb += vec3(0.36, 0.20, 0.85) * rim * 0.22 * uActive;

    color.a = max(base.a, reveal.a * mask);

    gl_FragColor = color;

    #include <colorspace_fragment>
  }
`;
