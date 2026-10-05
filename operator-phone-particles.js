import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gsap } from "gsap";
import { createTransparentOutputPass } from "./cinematic-alpha-pass.js";
import { CAPABILITY_SHAPES } from "./operator-anchors.mjs";

// Particle illustrations for the Operator capability phone, built the way the Visionary pillar
// constellation is: shapes are stroke/fill primitives with per-point weights, sorted by angle so
// particle i has a partner in every shape, then morphed in the vertex shader with additive glow.
// Coordinates are portrait: x spans about ±1.3 and y about ±2.4 inside the phone screen.
export const PARTICLE_COUNT = 4200;
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => t * t * (3 - 2 * t);
const seeded = (seed = 92317) => () => {
  seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
  return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
};

function createShape(seed) {
  const random = seeded(seed);
  const out = [];
  const shape = {
    random,
    point(x, y, z, weight = 1) { out.push(x, y, z, weight); },
    line(count, a, b, { width = .05, depth = .12, weight = 1, z = 0 } = {}) {
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const nx = -(b[1] - a[1]) / length;
      const ny = (b[0] - a[0]) / length;
      for (let i = 0; i < count; i += 1) {
        const t = random();
        const offset = (random() - .5) * width;
        shape.point(lerp(a[0], b[0], t) + nx * offset, lerp(a[1], b[1], t) + ny * offset, z + (random() - .5) * depth, weight);
      }
    },
    ring(count, cx, cy, rx, ry, { width = .06, z = 0, weight = 1 } = {}) {
      for (let i = 0; i < count; i += 1) {
        const angle = random() * Math.PI * 2;
        const grow = 1 + (random() - .5) * width / Math.max(rx, ry);
        shape.point(cx + Math.cos(angle) * rx * grow, cy + Math.sin(angle) * ry * grow, z + (random() - .5) * .14, weight);
      }
    },
    disc(count, cx, cy, rx, ry, { inner = 0, z = 0, weight = .5 } = {}) {
      for (let i = 0; i < count; i += 1) {
        const angle = random() * Math.PI * 2;
        const radius = Math.sqrt(inner * inner + random() * (1 - inner * inner));
        shape.point(cx + Math.cos(angle) * rx * radius, cy + Math.sin(angle) * ry * radius, z + (random() - .5) * .2, weight);
      }
    },
    rect(count, x0, y0, x1, y1, { z = 0, weight = .45 } = {}) {
      for (let i = 0; i < count; i += 1) shape.point(lerp(x0, x1, random()), lerp(y0, y1, random()), z + (random() - .5) * .2, weight);
    },
    outline(count, x0, y0, x1, y1, options) {
      const w = x1 - x0;
      const h = y1 - y0;
      const total = (w + h) * 2;
      [[[x0, y0], [x1, y0], w], [[x1, y0], [x1, y1], h], [[x1, y1], [x0, y1], w], [[x0, y1], [x0, y0], h]]
        .forEach(([from, to, length]) => shape.line(Math.round(count * length / total), from, to, options));
    },
    // Four-point spark: the AI "assist" mark.
    spark(count, cx, cy, r) {
      const quarter = Math.floor(count / 4);
      shape.line(quarter, [cx, cy - r], [cx, cy + r], { width: .07, z: .1 });
      shape.line(quarter, [cx - r, cy], [cx + r, cy], { width: .07, z: .1 });
      shape.line(quarter, [cx - r * .42, cy - r * .42], [cx + r * .42, cy + r * .42], { width: .05, z: .1 });
      shape.line(quarter, [cx - r * .42, cy + r * .42], [cx + r * .42, cy - r * .42], { width: .05, z: .1 });
    },
    // Head and shoulders.
    person(count, cx, cy, scale = 1) {
      shape.ring(Math.floor(count * .18), cx, cy + .58 * scale, .3 * scale, .3 * scale, { width: .05, z: .05 });
      shape.disc(Math.floor(count * .26), cx, cy + .58 * scale, .29 * scale, .29 * scale, { z: .05, weight: .6 });
      shape.ring(Math.floor(count * .22), cx, cy - .3 * scale, .58 * scale, .48 * scale, { width: .06 });
      shape.disc(Math.floor(count * .34), cx, cy - .3 * scale, .56 * scale, .46 * scale, { weight: .45 });
    },
    scatter(count, spread = 1, weight = .3) {
      for (let i = 0; i < count; i += 1) shape.point((random() - .5) * 2.6 * spread, (random() - .5) * 4.4 * spread, (random() - .5) * .8, weight);
    },
    finish(count, filler) {
      while (out.length < count * 4) filler();
      return sortedPositions(out.slice(0, count * 4));
    },
  };
  return shape;
}

function sortedPositions(values) {
  const points = [];
  for (let i = 0; i < values.length; i += 4) points.push([values[i], values[i + 1], values[i + 2], values[i + 3]]);
  points.sort((a, b) => {
    const angle = Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]);
    return Math.abs(angle) > .001 ? angle : Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]);
  });
  const positions = new Float32Array(points.length * 3);
  const weights = new Float32Array(points.length);
  points.forEach(([x, y, z, weight], index) => { positions.set([x, y, z], index * 3); weights[index] = weight; });
  return { positions, weights };
}

const SHAPES = {
  // Peer recognition: two colleagues joined by a halo, with a spark of appreciation above.
  recognition(count, seed) {
    const s = createShape(seed);
    const n = (share) => Math.floor(count * share);
    s.person(n(.26), -.72, .05, .95);
    s.person(n(.26), .72, .05, .95);
    s.ring(n(.1), 0, .15, 1.2, .95, { width: .06, weight: .7 });
    s.spark(n(.12), 0, 1.6, .4);
    return s.finish(count, () => s.scatter(1, .85, .25));
  },
  // AI-assisted messages: a speech bubble with three lines of message and an assist spark.
  "ai-message"(count, seed) {
    const s = createShape(seed);
    const n = (share) => Math.floor(count * share);
    s.outline(n(.16), -1, -.55, 1, .95, { width: .06 });
    s.rect(n(.12), -1, -.55, 1, .95, { weight: .3 });
    s.line(n(.03), [-.7, -.55], [-.95, -1], { width: .06 });
    s.line(n(.03), [-.95, -1], [-.4, -.55], { width: .06 });
    s.line(n(.07), [-.75, .55], [.7, .55], { width: .08 });
    s.line(n(.06), [-.75, .2], [.45, .2], { width: .08 });
    s.line(n(.05), [-.75, -.15], [.2, -.15], { width: .08, weight: .8 });
    s.spark(n(.1), .85, 1.5, .4);
    s.spark(n(.04), -.9, 1.35, .2);
    return s.finish(count, () => s.scatter(1, .9, .25));
  },
  // Company feed: three stacked posts, the top one collecting reactions.
  feed(count, seed) {
    const s = createShape(seed);
    const n = (share) => Math.floor(count * share);
    [[.9, 2], [-.45, .65], [-1.8, -.7]].forEach(([y0, y1], index) => {
      const mid = (y0 + y1) / 2;
      s.outline(n(.1), -1.05, y0, 1.05, y1, { width: .06 });
      s.rect(n(.03), -1.05, y0, 1.05, y1, { weight: index === 0 ? .22 : .16 });
      s.ring(n(.03), -.7, mid + .15, .2, .2, { width: .05, z: .05 });
      s.disc(n(.03), -.7, mid + .15, .19, .19, { z: .05, weight: .75 });
      s.line(n(.04), [-.35, mid + .2], [.8, mid + .2], { width: .09 });
      s.line(n(.03), [-.35, mid - .15], [.4, mid - .15], { width: .08, weight: .85 });
    });
    [.25, .55, .85].forEach((x) => {
      s.ring(n(.012), x, 1.05, .13, .13, { width: .04, z: .1 });
      s.disc(n(.015), x, 1.05, .12, .12, { z: .1, weight: .95 });
    });
    return s.finish(count, () => s.scatter(1, .9, .22));
  },
  // Rewards catalogue: a wrapped gift with a spark above the bow.
  catalogue(count, seed) {
    const s = createShape(seed);
    const n = (share) => Math.floor(count * share);
    s.outline(n(.12), -1, -1.7, 1, -.1, { width: .07 });
    s.rect(n(.18), -1, -1.7, 1, -.3, { weight: .35 });
    s.outline(n(.08), -1.18, -.3, 1.18, .25, { width: .07 });
    s.rect(n(.1), -1.18, -.3, 1.18, .25, { z: .04, weight: .5 });
    s.rect(n(.1), -.18, -1.7, .18, .25, { z: .08, weight: .75 });
    s.line(n(.03), [-.18, -1.7], [-.18, .25], { width: .05 });
    s.line(n(.03), [.18, -1.7], [.18, .25], { width: .05 });
    s.ring(n(.05), -.45, .55, .5, .3, { width: .07, z: .04 });
    s.ring(n(.05), .45, .55, .5, .3, { width: .07, z: .04 });
    s.disc(n(.05), -.45, .55, .48, .28, { z: .04, weight: .55 });
    s.disc(n(.05), .45, .55, .48, .28, { z: .04, weight: .55 });
    s.spark(n(.06), 0, 1.6, .35);
    return s.finish(count, () => s.scatter(1, .9, .25));
  },
  // Direct assignment: three people in a list, two of them selected.
  assignment(count, seed) {
    const s = createShape(seed);
    const n = (share) => Math.floor(count * share);
    [1.2, 0, -1.2].forEach((y, index) => {
      s.ring(n(.025), -.8, y, .3, .3, { width: .05, z: .05 });
      s.disc(n(.04), -.8, y, .29, .29, { z: .05, weight: .6 });
      s.line(n(.04), [-.35, y + .12], [.45, y + .12], { width: .08 });
      s.line(n(.03), [-.35, y - .2], [.15, y - .2], { width: .06, weight: .7 });
      s.ring(n(.03), .92, y, .25, .25, { width: .05 });
      if (index < 2) {
        s.disc(n(.025), .92, y, .24, .24, { weight: .5 });
        s.line(n(.02), [.78, y], [.9, y - .12], { width: .06, z: .08 });
        s.line(n(.025), [.9, y - .12], [1.08, y + .14], { width: .06, z: .08 });
      }
    });
    return s.finish(count, () => s.scatter(1, .9, .22));
  },
  // Onboarding: a team arriving through an upload arrow into the workspace tray.
  onboarding(count, seed) {
    const s = createShape(seed);
    const n = (share) => Math.floor(count * share);
    s.line(n(.05), [-1.05, -1], [-1.05, -1.75], { width: .06 });
    s.line(n(.08), [-1.05, -1.75], [1.05, -1.75], { width: .06 });
    s.line(n(.05), [1.05, -1.75], [1.05, -1], { width: .06 });
    s.rect(n(.08), -1.05, -1.75, 1.05, -1.05, { weight: .3 });
    s.line(n(.14), [0, -.65], [0, 1.2], { width: .12 });
    s.line(n(.07), [0, 1.2], [-.6, .6], { width: .1 });
    s.line(n(.07), [0, 1.2], [.6, .6], { width: .1 });
    [-.9, -.45, 0, .45, .9].forEach((x) => {
      s.ring(n(.012), x, 1.9, .13, .13, { width: .04, z: .05 });
      s.disc(n(.02), x, 1.9, .12, .12, { z: .05, weight: .7 });
    });
    return s.finish(count, () => s.scatter(1, .9, .22));
  },
  // Culture reporting: activity bars with a rising trend line.
  reporting(count, seed) {
    const s = createShape(seed);
    const n = (share) => Math.floor(count * share);
    s.line(n(.05), [-1.15, -1.7], [1.15, -1.7], { width: .05 });
    s.line(n(.04), [-1.15, -1.7], [-1.15, 1.6], { width: .05 });
    const bars = [[-.95, .6], [-.5, 1.1], [-.05, .9], [.4, 1.6], [.85, 2.2]];
    bars.forEach(([x, height]) => {
      s.outline(n(.04), x - .15, -1.7, x + .15, -1.7 + height, { width: .05 });
      s.rect(n(.06), x - .15, -1.7, x + .15, -1.7 + height, { weight: .35 });
    });
    for (let i = 0; i < bars.length - 1; i += 1) {
      s.line(n(.04), [bars[i][0], -1.5 + bars[i][1]], [bars[i + 1][0], -1.5 + bars[i + 1][1]], { width: .07, z: .12 });
    }
    bars.forEach(([x, height]) => s.disc(n(.012), x, -1.5 + height, .09, .09, { z: .12, weight: .95 }));
    return s.finish(count, () => s.scatter(1, .9, .22));
  },
  // AI Report Assistant: a question in a pill, an answer card with a highlighted value, and a spark.
  assistant(count, seed) {
    const s = createShape(seed);
    const n = (share) => Math.floor(count * share);
    s.outline(n(.12), -1.05, .95, 1.05, 1.55, { width: .06 });
    s.ring(n(.03), -.75, 1.25, .18, .18, { width: .05, z: .05 });
    s.disc(n(.02), -.75, 1.25, .17, .17, { z: .05, weight: .8 });
    s.line(n(.05), [-.45, 1.25], [.6, 1.25], { width: .08, weight: .85 });
    s.outline(n(.15), -1.05, -1.7, 1.05, .45, { width: .06 });
    s.rect(n(.04), -1.05, -1.7, 1.05, .45, { weight: .16 });
    s.line(n(.06), [-.8, .1], [.75, .1], { width: .09 });
    s.line(n(.06), [-.8, -.3], [.5, -.3], { width: .09 });
    s.line(n(.06), [-.8, -.7], [.65, -.7], { width: .09 });
    s.outline(n(.04), -.8, -1.4, -.1, -1.05, { width: .05, z: .08 });
    s.rect(n(.05), -.8, -1.4, -.1, -1.05, { z: .08, weight: .9 });
    s.spark(n(.08), .85, 1.95, .38);
    return s.finish(count, () => s.scatter(1, .9, .22));
  },
};

export class PhoneParticles {
  constructor({ host, canvas, colors, bloom = true, onState, onFailure }) {
    this.host = host;
    this.canvas = canvas;
    this.colors = colors.map((hex) => new THREE.Color(hex));
    this.bloom = bloom;
    this.onState = onState;
    this.onFailure = onFailure;
    this.frame = 0;
    this.running = false;
    this.stage = -1;
    this.mix = 1;
    this.samples = [];
    this.pointer = new THREE.Vector2(20, 20);
    this.pointerTarget = new THREE.Vector2(20, 20);
    this.init(PARTICLE_COUNT);
  }

  init(count) {
    try {
      const probe = this.canvas.getContext("webgl2", { alpha: true }) || this.canvas.getContext("webgl", { alpha: true });
      if (!probe) throw new Error("WebGL unavailable");
      // Software GL (remote desktops, VMs, headless browsers) cannot afford bloom or a high pixel ratio.
      const debugInfo = probe.getExtension("WEBGL_debug_renderer_info");
      const software = /swiftshader|llvmpipe|software/i.test(debugInfo ? probe.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "");
      if (software) { this.bloom = false; this.host.dataset.performanceTier = "software"; }
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(software ? 1 : Math.min(devicePixelRatio || 1, 1.5));
      this.renderer.setClearColor(0x000000, 0);
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(40, .5, .1, 30);
      this.camera.position.z = 7.4;
      this.group = new THREE.Group();
      this.scene.add(this.group);
      this.buildParticles(count);
      this.buildStars(160);
      if (this.bloom) {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), .5, .35, .7));
        this.composer.addPass(createTransparentOutputPass());
      }
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.host);
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.onState?.(entry.isIntersecting ? "active" : "paused");
        if (entry.isIntersecting) this.start(); else this.stop();
      }, { rootMargin: "300px" });
      this.intersectionObserver.observe(this.host);
      this.resize();
      this.count = count;
    } catch (error) {
      this.dispose();
      this.onFailure?.(error);
    }
  }

  buildParticles(count) {
    this.shapes = CAPABILITY_SHAPES.map((name, index) => SHAPES[name](count, 11 + index * 17));
    const geometry = new THREE.BufferGeometry();
    this.from = new Float32Array(this.shapes[0].positions);
    this.to = new Float32Array(this.shapes[0].positions);
    this.weights = new Float32Array(count * 2);
    for (let i = 0; i < count; i += 1) this.weights.set([this.shapes[0].weights[i], this.shapes[0].weights[i]], i * 2);
    const seeds = new Float32Array(count);
    const random = seeded(71);
    for (let i = 0; i < count; i += 1) seeds[i] = random();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.from, 3));
    geometry.setAttribute("aTo", new THREE.BufferAttribute(this.to, 3));
    geometry.setAttribute("aWeight", new THREE.BufferAttribute(this.weights, 2));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    this.colorFrom = this.colors[0].clone();
    this.colorTo = this.colors[0].clone();
    this.uniforms = {
      uTime: { value: 0 }, uMix: { value: 1 },
      uColorFrom: { value: this.colorFrom }, uColorTo: { value: this.colorTo },
      uPointer: { value: this.pointer }, uPointerStrength: { value: .2 },
      uPixelRatio: { value: this.renderer.getPixelRatio() },
    };
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: this.uniforms,
      vertexShader: `attribute vec3 aTo; attribute vec2 aWeight; attribute float aSeed;
        uniform float uTime; uniform float uMix; uniform vec2 uPointer; uniform float uPointerStrength; uniform float uPixelRatio;
        varying float vAlpha;
        void main(){
          float morph = smoothstep(0., 1., uMix);
          vec3 p = mix(position, aTo, morph);
          float weight = mix(aWeight.x, aWeight.y, morph);
          float breath = sin(uTime * .85 + aSeed * 6.283) * .016;
          p *= 1. + breath;
          // Particles mid-flight drift outward, so a morph reads as a burst that re-forms.
          p.xy += normalize(p.xy + vec2(.0001)) * sin(morph * 3.1416) * (.12 + aSeed * .2);
          float distanceToPointer = distance(p.xy, uPointer);
          vec2 direction = normalize(p.xy - uPointer + vec2(.0001));
          p.xy += direction * max(0., .6 - distanceToPointer) * uPointerStrength;
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.9 + aSeed * 1.9) * mix(.8, 1., weight) * uPixelRatio * (7. / -mv.z);
          vAlpha = (.42 + aSeed * .46) * weight;
        }`,
      fragmentShader: `uniform float uMix; uniform vec3 uColorFrom; uniform vec3 uColorTo; varying float vAlpha;
        void main(){
          float d = distance(gl_PointCoord, vec2(.5));
          if(d > .5) discard;
          float glow = smoothstep(.5, .04, d);
          gl_FragColor = vec4(mix(uColorFrom, uColorTo, smoothstep(0., 1., uMix)), glow * vAlpha);
        }`,
    });
    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
  }

  buildStars(count) {
    const values = new Float32Array(count * 3);
    const random = seeded(157);
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (random() - .5) * 3.2;
      values[i + 1] = (random() - .5) * 6;
      values[i + 2] = -1.5 - random() * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(values, 3));
    this.stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x8bdcff, size: .02, transparent: true, opacity: .22, depthWrite: false }));
    this.group.add(this.stars);
  }

  // Morph to a shape. The current in-flight positions become the new start, so a change mid-morph
  // continues from where the particles are instead of snapping.
  setStage(index, { instant = false } = {}) {
    if (!this.uniforms || index === this.stage) return;
    const morph = smoothstep(Math.min(1, Math.max(0, this.mix)));
    for (let i = 0; i < this.from.length; i += 1) this.from[i] = lerp(this.from[i], this.to[i], morph);
    for (let i = 0; i < this.count; i += 1) this.weights[i * 2] = lerp(this.weights[i * 2], this.weights[i * 2 + 1], morph);
    this.colorFrom.lerp(this.colorTo, morph);
    const shape = this.shapes[index];
    this.to.set(shape.positions);
    for (let i = 0; i < this.count; i += 1) this.weights[i * 2 + 1] = shape.weights[i];
    this.colorTo.copy(this.colors[index % this.colors.length]);
    const geometry = this.particles.geometry;
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aTo.needsUpdate = true;
    geometry.attributes.aWeight.needsUpdate = true;
    this.stage = index;
    this.tween?.kill();
    this.mix = instant ? 1 : 0;
    this.uniforms.uMix.value = this.mix;
    if (!instant) this.tween = gsap.to(this, { mix: 1, duration: 1.15, ease: "power2.inOut", onUpdate: () => { this.uniforms.uMix.value = this.mix; } });
    this.host.dataset.activeShape = CAPABILITY_SHAPES[index];
  }

  // Pointer in screen-fraction coordinates (0–1); off-screen when null.
  setPointer(x, y) {
    if (x === null) this.pointerTarget.set(20, 20);
    else this.pointerTarget.set((x * 2 - 1) * 1.3, -(y * 2 - 1) * 2.6);
  }

  resize() {
    if (!this.renderer) return;
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer?.setSize(width, height);
  }

  start() {
    if (this.running || !this.renderer) return;
    this.running = true;
    this.lastTime = performance.now();
    const render = (now) => {
      if (!this.running) return;
      const elapsed = Math.min(now - this.lastTime, 50);
      this.lastTime = now;
      this.samples.push(elapsed);
      if (this.samples.length > 90) this.samples.shift();
      this.uniforms.uTime.value = now / 1000;
      this.pointer.lerp(this.pointerTarget, .08);
      this.stars.rotation.z = now * .00001;
      if (this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
      if (this.samples.length === 90 && this.samples.reduce((sum, value) => sum + value, 0) / 90 > 24 && !this.reduced) this.reduceLoad();
      this.frame = requestAnimationFrame(render);
    };
    this.frame = requestAnimationFrame(render);
  }

  reduceLoad() {
    this.reduced = true;
    this.renderer.setPixelRatio(1);
    this.uniforms.uPixelRatio.value = 1;
    // Shapes are angle-sorted, so thin evenly rather than truncating a wedge.
    const kept = new Uint32Array(Math.ceil(this.count / 2)).map((_, index) => index * 2);
    this.particles.geometry.setIndex(new THREE.BufferAttribute(kept, 1));
    this.host.dataset.performanceTier = "reduced";
  }

  stop() { this.running = false; cancelAnimationFrame(this.frame); }

  dispose() {
    this.stop();
    this.tween?.kill();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.particles?.geometry.dispose();
    this.particles?.material.dispose();
    this.stars?.geometry.dispose();
    this.stars?.material.dispose();
    this.composer?.dispose?.();
    this.renderer?.dispose();
    this.renderer = null;
    delete this.host.dataset.activeShape;
    delete this.host.dataset.performanceTier;
  }
}
