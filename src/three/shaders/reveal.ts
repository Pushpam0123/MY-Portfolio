/**
 * Shader pair for the hero avatar.
 *
 * The effect: two pixel-aligned textures (the render and its chrome grade) are
 * blended by a mask that follows the pointer, with a ripple pushing the UVs
 * outward from the pointer so the boundary reads as liquid rather than as a
 * hard circular wipe.
 *
 * Alignment between the two textures is the entire trick — both are derived
 * from a single crop in scripts/prepare-assets.mjs for exactly this reason.
 */

export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uBase;      // the original render
  uniform sampler2D uReveal;    // the chrome grade, identically framed
  uniform vec2  uPointer;       // pointer position in UV space
  uniform float uActive;        // 0 → 1, eased presence of the pointer
  uniform float uTime;
  uniform float uRadius;
  uniform float uAspect;        // plane aspect, so the mask stays circular

  varying vec2 vUv;

  void main() {
    // Correct for the plane's aspect ratio, otherwise the "circle" is an oval.
    vec2 aspect = vec2(uAspect, 1.0);
    vec2 toPointer = (vUv - uPointer) * aspect;
    float dist = length(toPointer);

    // Concentric ripple riding outward from the pointer.
    float wave = sin(dist * 34.0 - uTime * 4.2) * 0.5 + 0.5;
    float falloff = smoothstep(uRadius, 0.0, dist);
    float ripple = wave * falloff * uActive;

    // Displace UVs along the pointer vector — this is what makes the metal
    // look like it is being pushed through a liquid surface.
    vec2 dir = dist > 0.0001 ? normalize(toPointer) : vec2(0.0);
    vec2 offset = dir * ripple * 0.018;
    vec2 uvBase = clamp(vUv + offset * 0.35, 0.0, 1.0);
    vec2 uvReveal = clamp(vUv - offset, 0.0, 1.0);

    vec4 base = texture2D(uBase, uvBase);
    vec4 reveal = texture2D(uReveal, uvReveal);

    // Soft-edged mask, wobbled by the ripple so the boundary is never a
    // perfect circle.
    float edge = uRadius * (0.62 + ripple * 0.3);
    float mask = smoothstep(edge, edge * 0.35, dist) * uActive;

    vec4 color = mix(base, reveal, mask);

    // Violet rim exactly at the transition, which sells it as an energy front.
    // Added in linear light, so it lands far hotter than the same number would
    // in sRGB — hence the low multiplier for what is still a visible rim.
    float rim = smoothstep(0.0, 0.35, mask) * smoothstep(1.0, 0.55, mask);
    color.rgb += vec3(0.36, 0.20, 0.85) * rim * 0.22 * uActive;

    // Premultiply-safe: the source PNGs carry a radial alpha falloff, and the
    // displaced sample can disagree with the base one at the soft edge. Taking
    // the max avoids a dark fringe appearing along the boundary.
    color.a = max(base.a, reveal.a * mask);

    gl_FragColor = color;

    /*
     * Encode linear → the renderer's output colour space.
     *
     * Both textures are tagged SRGBColorSpace, so the GPU decodes them to
     * linear light at sample time. Everything above therefore works in linear,
     * and writing that straight to the sRGB framebuffer displayed the portrait
     * at roughly half its real luminance — the face came out markedly darker
     * than the source render, and darker than the StaticAvatar fallback of the
     * same image. Built-in materials append this chunk for exactly this reason;
     * a hand-written fragment shader has to do it itself.
     */
    #include <colorspace_fragment>
  }
`;
