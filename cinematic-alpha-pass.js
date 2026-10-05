import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

// UnrealBloomPass composites with alpha 1, which paints the canvas black. This final pass derives alpha
// from brightness (premultiplied), so the particles and bloom glow over the section background instead.
export function createTransparentOutputPass() {
  return new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
      void main() {
        vec3 color = texture2D(tDiffuse, vUv).rgb;
        gl_FragColor = vec4(color, clamp(max(color.r, max(color.g, color.b)), 0., 1.));
      }`,
  });
}
