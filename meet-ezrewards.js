import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { smoothScrollTo } from "./visionary-smooth-scroll.js";
import { createTransparentOutputPass } from "./cinematic-alpha-pass.js";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = ["recognition", "rewards", "insight"];
const PARTICLE_COUNTS = { full: 7200, adaptive: 3600 };
const COLORS = [new THREE.Color("#82efc8"), new THREE.Color("#ffc978"), new THREE.Color("#c5a6ff")];
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const seeded = (seed = 92317) => () => {
  seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
  return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
};

// Shapes are built from bright strokes plus dimmer interior fills; each point carries a weight (stroke 1, fill < 1).
function createShape(seed) {
  const random = seeded(seed);
  const out = [];
  const shape = {
    random,
    point(x, y, z, weight = 1) { out.push(x, y, z, weight); },
    // Thick stroke between two points.
    line(count, a, b, { width = .05, depth = .12, weight = 1 } = {}) {
      const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const nx = -(b[1] - a[1]) / length;
      const ny = (b[0] - a[0]) / length;
      for (let i = 0; i < count; i += 1) {
        const t = random();
        const offset = (random() - .5) * width;
        shape.point(
          THREE.MathUtils.lerp(a[0], b[0], t) + nx * offset,
          THREE.MathUtils.lerp(a[1], b[1], t) + ny * offset,
          THREE.MathUtils.lerp(a[2] || 0, b[2] || 0, t) + (random() - .5) * depth,
          weight,
        );
      }
    },
    // Elliptical band of the given radial thickness.
    ring(count, cx, cy, rx, ry, { width = .06, z = 0, weight = 1 } = {}) {
      for (let i = 0; i < count; i += 1) {
        const angle = random() * Math.PI * 2;
        const grow = 1 + (random() - .5) * width / Math.max(rx, ry);
        shape.point(cx + Math.cos(angle) * rx * grow, cy + Math.sin(angle) * ry * grow, z + (random() - .5) * .14, weight);
      }
    },
    // Area-uniform ellipse fill; `inner` (0–1) leaves a hole for annuli.
    disc(count, cx, cy, rx, ry, { inner = 0, z = 0, weight = .5 } = {}) {
      for (let i = 0; i < count; i += 1) {
        const angle = random() * Math.PI * 2;
        const radius = Math.sqrt(inner * inner + random() * (1 - inner * inner));
        shape.point(cx + Math.cos(angle) * rx * radius, cy + Math.sin(angle) * ry * radius, z + (random() - .5) * .2, weight);
      }
    },
    rect(count, x0, y0, x1, y1, { z = 0, weight = .45 } = {}) {
      for (let i = 0; i < count; i += 1) shape.point(THREE.MathUtils.lerp(x0, x1, random()), THREE.MathUtils.lerp(y0, y1, random()), z + (random() - .5) * .2, weight);
    },
    outline(count, x0, y0, x1, y1, options) {
      const w = x1 - x0;
      const h = y1 - y0;
      const total = (w + h) * 2;
      [[[x0, y0], [x1, y0], w], [[x1, y0], [x1, y1], h], [[x1, y1], [x0, y1], w], [[x0, y1], [x0, y0], h]]
        .forEach(([from, to, length]) => shape.line(Math.round(count * length / total), from, to, options));
    },
    finish(count, filler) {
      while (out.length < count * 4) filler();
      return sortedPositions(out.slice(0, count * 4));
    },
  };
  return shape;
}

// Sorting every shape by angle pairs particles across shapes so morphs sweep around the centre.
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

// Recognition: a person held inside two halo rings.
function recognitionShape(count, seed) {
  const s = createShape(seed);
  const n = (share) => Math.floor(count * share);
  s.ring(n(.15), 0, 0, 2.05, 2.05, { width: .09 });
  s.ring(n(.11), 0, 0, 1.48, 1.48, { width: .07 });
  s.disc(n(.07), 0, 0, 2.02, 2.02, { inner: .74, weight: .2 });
  s.disc(n(.06), 0, 0, 1.45, 1.45, { weight: .14 });
  s.ring(n(.06), 0, .38, .42, .42, { width: .05, z: .08 });
  s.disc(n(.12), 0, .38, .4, .4, { z: .08, weight: .6 });
  s.ring(n(.09), 0, -.6, 1.02, .75, { width: .06, z: -.05 });
  s.disc(n(.2), 0, -.6, 1, .73, { z: -.05, weight: .5 });
  return s.finish(count, () => {
    const angle = s.random() * Math.PI * 2;
    const radius = 2.25 + s.random() * .4;
    s.point(Math.cos(angle) * radius, Math.sin(angle) * radius, (s.random() - .5) * .3, .55);
  });
}

// Rewards: a wrapped gift — box, lid, ribbon and bow.
function giftShape(count, seed) {
  const s = createShape(seed);
  const n = (share) => Math.floor(count * share);
  s.outline(n(.12), -1.8, -1.35, 1.8, 1, { width: .07 });
  s.rect(n(.22), -1.8, -1.35, 1.8, .55, { weight: .38 });
  s.outline(n(.08), -2.12, .55, 2.12, 1.22, { width: .07 });
  s.rect(n(.1), -2.12, .55, 2.12, 1.22, { z: .04, weight: .5 });
  s.rect(n(.1), -.3, -1.35, .3, 1.22, { z: .08, weight: .75 });
  s.line(n(.03), [-.3, -1.35], [-.3, 1.22], { width: .05 });
  s.line(n(.03), [.3, -1.35], [.3, 1.22], { width: .05 });
  s.ring(n(.06), -.72, 1.47, .82, .48, { width: .07, z: .04 });
  s.ring(n(.06), .72, 1.47, .82, .48, { width: .07, z: .04 });
  s.disc(n(.07), -.72, 1.47, .8, .46, { z: .04, weight: .55 });
  s.disc(n(.07), .72, 1.47, .8, .46, { z: .04, weight: .55 });
  return s.finish(count, () => s.point((s.random() - .5) * 3.2, (s.random() - .5) * 2.1, (s.random() - .5) * .8, .35));
}

// Insight: a rising network of connected culture signals.
function insightShape(count, seed) {
  const s = createShape(seed);
  const nodes = [[-2, -1.25], [-1.15, -.25], [-.25, -.72], [.62, .4], [1.4, .85], [2, 1.55]];
  const connections = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 2], [1, 3], [3, 5]];
  const perConnection = Math.floor(count * .4 / connections.length);
  connections.forEach(([a, b]) => s.line(perConnection, nodes[a], nodes[b], { width: .07, depth: .32 }));
  const perNode = Math.floor(count * .3 / nodes.length);
  nodes.forEach(([x, y], index) => {
    const radius = .16 + index * .018;
    s.ring(Math.floor(perNode * .35), x, y, radius, radius, { width: .05, z: .08 });
    s.disc(Math.floor(perNode * .65), x, y, radius * 1.05, radius * 1.05, { z: .08, weight: .8 });
  });
  return s.finish(count, () => {
    const x = (s.random() - .5) * 4.5;
    s.point(x, -1.5 + (x + 2.25) * .6 + (s.random() - .5) * .7, (s.random() - .5) * .55, .3);
  });
}

class AppreciationConstellation {
  constructor(section, mode, onFailure) {
    this.section = section;
    this.mode = mode;
    this.canvas = section.querySelector("[data-meet-canvas]");
    this.host = section.querySelector(".cinematic-meet__visual");
    this.onFailure = onFailure;
    this.frame = 0;
    this.visible = false;
    this.running = false;
    this.stage = 0;
    this.mix = 0;
    this.samples = [];
    this.pointer = new THREE.Vector2(20, 20);
    this.pointerTarget = new THREE.Vector2(20, 20);
    this.parallax = new THREE.Vector2();
    this.abort = new AbortController();
    this.init(PARTICLE_COUNTS[mode] || PARTICLE_COUNTS.adaptive);
  }

  init(count) {
    try {
      const probe = this.canvas.getContext("webgl2", { alpha: true }) || this.canvas.getContext("webgl", { alpha: true });
      if (!probe) throw new Error("WebGL unavailable");
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      this.renderer.setClearColor(0x000000, 0);
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(40, 1, .1, 30);
      this.camera.position.z = 7.2;
      this.group = new THREE.Group();
      this.scene.add(this.group);
      this.buildParticles(count);
      this.buildStars(this.mode === "full" ? 260 : 120);
      if (this.mode === "full") {
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .45, .35, .72);
        bloom.strength = .45; bloom.radius = .35; bloom.threshold = .72;
        this.composer.addPass(bloom);
        this.composer.addPass(createTransparentOutputPass());
      }
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.host);
      this.intersectionObserver = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        this.section.dataset.renderState = this.visible ? "active" : "paused";
        if (this.visible) this.start(); else this.stop();
      }, { rootMargin: "300px" });
      this.intersectionObserver.observe(this.section);
      if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
        this.host.addEventListener("pointermove", (event) => this.onPointer(event), { signal: this.abort.signal });
        this.host.addEventListener("pointerleave", () => this.pointerTarget.set(20, 20), { signal: this.abort.signal });
      }
      this.resize();
      this.section.dataset.particleCount = String(count);
    } catch (error) {
      this.dispose();
      this.onFailure(error);
    }
  }

  buildParticles(count) {
    const geometry = new THREE.BufferGeometry();
    const shapes = [recognitionShape(count, 11), giftShape(count, 29), insightShape(count, 47)];
    geometry.setAttribute("position", new THREE.BufferAttribute(shapes[0].positions, 3));
    geometry.setAttribute("aShape1", new THREE.BufferAttribute(shapes[1].positions, 3));
    geometry.setAttribute("aShape2", new THREE.BufferAttribute(shapes[2].positions, 3));
    const weights = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) weights.set([shapes[0].weights[i], shapes[1].weights[i], shapes[2].weights[i]], i * 3);
    geometry.setAttribute("aWeight", new THREE.BufferAttribute(weights, 3));
    const seeds = new Float32Array(count);
    const random = seeded(71);
    for (let i = 0; i < count; i += 1) seeds[i] = random();
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    this.uniforms = {
      uTime: { value: 0 }, uStage: { value: 0 }, uMix: { value: 0 },
      uColor0: { value: COLORS[0] }, uColor1: { value: COLORS[1] }, uColor2: { value: COLORS[2] },
      uPointer: { value: this.pointer }, uPointerStrength: { value: this.mode === "full" ? .22 : 0 },
      uPixelRatio: { value: Math.min(devicePixelRatio || 1, 1.5) },
    };
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: this.uniforms,
      vertexShader: `attribute vec3 aShape1; attribute vec3 aShape2; attribute vec3 aWeight; attribute float aSeed;
        uniform float uTime; uniform float uStage; uniform float uMix; uniform vec2 uPointer; uniform float uPointerStrength; uniform float uPixelRatio;
        varying float vAlpha;
        void main(){
          vec3 fromPosition = uStage < .5 ? position : aShape1;
          vec3 toPosition = uStage < .5 ? aShape1 : aShape2;
          float morph = smoothstep(0., 1., uMix);
          vec3 p = mix(fromPosition, toPosition, morph);
          float weight = uStage < .5 ? mix(aWeight.x, aWeight.y, morph) : mix(aWeight.y, aWeight.z, morph);
          float breath = sin(uTime * .85 + aSeed * 6.283) * .018;
          p *= 1. + breath;
          float distanceToPointer = distance(p.xy, uPointer);
          vec2 direction = normalize(p.xy - uPointer + vec2(.0001));
          p.xy += direction * max(0., .68 - distanceToPointer) * uPointerStrength;
          vec4 mv = modelViewMatrix * vec4(p, 1.);
          gl_Position = projectionMatrix * mv;
          // Fill particles (weight < 1) are a touch smaller and dimmer so solid areas read as filled, not blown out.
          gl_PointSize = (1.8 + aSeed * 1.9) * mix(.8, 1., weight) * uPixelRatio * (7. / -mv.z);
          vAlpha = (.42 + aSeed * .46) * weight;
        }`,
      fragmentShader: `uniform float uStage; uniform float uMix; uniform vec3 uColor0; uniform vec3 uColor1; uniform vec3 uColor2; varying float vAlpha;
        void main(){
          float d = distance(gl_PointCoord, vec2(.5));
          if(d > .5) discard;
          vec3 fromColor = uStage < .5 ? uColor0 : uColor1;
          vec3 toColor = uStage < .5 ? uColor1 : uColor2;
          float glow = smoothstep(.5, .04, d);
          gl_FragColor = vec4(mix(fromColor, toColor, uMix), glow * vAlpha);
        }`,
    });
    this.particles = new THREE.Points(geometry, material);
    this.group.add(this.particles);
  }

  buildStars(count) {
    const values = new Float32Array(count * 3);
    const random = seeded(157);
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (random() - .5) * 7;
      values[i + 1] = (random() - .5) * 5.5;
      values[i + 2] = -1.5 - random() * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(values, 3));
    const material = new THREE.PointsMaterial({ color: 0x9ddcc4, size: .018, transparent: true, opacity: .2, depthWrite: false });
    this.stars = new THREE.Points(geometry, material);
    this.group.add(this.stars);
  }

  onPointer(event) {
    const rect = this.host.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    this.pointerTarget.set(x * 2.6, y * 2.1);
    this.parallax.set(x * 12, -y * 12);
  }

  setProgress(progress) {
    if (!this.uniforms) return;
    if (progress < .32) { this.stage = 0; this.mix = clamp((progress - .22) / .1); }
    else if (progress < .65) { this.stage = 0; this.mix = progress < .38 ? clamp((progress - .26) / .12) : 1; }
    else { this.stage = 1; this.mix = clamp((progress - .59) / .12); }
    this.uniforms.uStage.value = this.stage;
    this.uniforms.uMix.value = this.mix;
  }

  resize() {
    if (!this.renderer || !this.host) return;
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
      this.group.position.x += ((this.parallax.x / Math.max(this.host.clientWidth, 1)) - this.group.position.x) * .05;
      this.group.position.y += ((this.parallax.y / Math.max(this.host.clientHeight, 1)) - this.group.position.y) * .05;
      this.stars.rotation.z = now * .000012;
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
    // Shapes are angle-sorted, so thin evenly (every other particle) rather than truncating, which would cut a wedge out.
    const total = this.particles.geometry.attributes.position.count;
    const kept = new Uint32Array(Math.ceil(total / 2)).map((_, index) => index * 2);
    this.particles.geometry.setIndex(new THREE.BufferAttribute(kept, 1));
    const targetCount = kept.length;
    this.section.dataset.particleCount = String(targetCount);
    this.section.dataset.performanceTier = "reduced";
  }

  stop() { this.running = false; cancelAnimationFrame(this.frame); }

  dispose() {
    this.stop();
    this.abort?.abort();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.scene?.traverse((object) => {
      object.geometry?.dispose?.();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose?.();
    });
    this.composer?.dispose?.();
    this.renderer?.dispose?.();
  }
}

function initMeetEzRewards() {
  const section = document.querySelector("[data-meet-ezrewards]");
  const page = section?.closest(".visionary-refresh");
  if (!section || !page) return;
  const tabs = [...section.querySelectorAll("[data-meet-pillar]")];
  const panels = [...section.querySelectorAll("[data-meet-panel]")];
  let mode = page.dataset.cinematicMode || "adaptive";
  let constellation;
  let trigger;
  let adaptiveFrame = 0;
  let activeIndex = 0;
  let abort = new AbortController();

  const isPhone = () => innerWidth < 768;
  const stageFromProgress = (progress) => progress < .32 ? 0 : progress < .65 ? 1 : 2;

  function setStaticSemantics() {
    panels.forEach((panel) => { panel.removeAttribute("aria-hidden"); panel.removeAttribute("inert"); });
  }

  function setActive(index, { moveScroll = false, focus = false } = {}) {
    activeIndex = clamp(index, 0, 2);
    section.dataset.activePillar = PILLARS[activeIndex];
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === activeIndex;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel, panelIndex) => {
      const selected = panelIndex === activeIndex;
      panel.setAttribute("aria-hidden", String(!selected));
      if (selected) panel.removeAttribute("inert"); else panel.setAttribute("inert", "");
    });
    if (focus) tabs[activeIndex]?.focus();
    if (moveScroll && mode === "full" && trigger) {
      const progress = [.16, .49, .78][activeIndex];
      smoothScrollTo(trigger.start + (trigger.end - trigger.start) * progress);
    } else if (moveScroll && mode === "adaptive") {
      const progress = [.16, .49, .78][activeIndex];
      const target = section.offsetTop - innerHeight * .55 + progress * (section.offsetHeight + innerHeight * .7);
      scrollTo({ top: target, behavior: "smooth" });
    }
  }

  function updateProgress(progress) {
    const normalized = clamp(progress);
    constellation?.setProgress(normalized);
    const nextIndex = stageFromProgress(normalized);
    if (nextIndex !== activeIndex) setActive(nextIndex);
    if (normalized >= .88) section.dataset.meetComplete = "true";
    else delete section.dataset.meetComplete;
  }

  function failToSvg() {
    section.dataset.renderState = "fallback";
    section.dataset.webglFallback = "true";
  }

  function setupFull() {
    section.classList.add("is-enhanced");
    constellation = new AppreciationConstellation(section, "full", failToSvg);
    const header = document.querySelector(".site-header");
    trigger = ScrollTrigger.create({
      trigger: section,
      pin: section.querySelector(".cinematic-meet__pin"),
      pinSpacing: false,
      start: () => `top ${header?.offsetHeight || 76}px`,
      end: () => `+=${innerHeight * 2.4}`,
      scrub: .8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => updateProgress(self.progress),
    });
  }

  function setupAdaptive() {
    section.classList.add("is-enhanced");
    constellation = new AppreciationConstellation(section, "adaptive", failToSvg);
    const onScroll = () => {
      if (adaptiveFrame) return;
      adaptiveFrame = requestAnimationFrame(() => {
        adaptiveFrame = 0;
        const bounds = section.getBoundingClientRect();
        updateProgress(clamp((innerHeight * .55 - bounds.top) / Math.max(bounds.height + innerHeight * .7, 1)));
      });
    };
    addEventListener("scroll", onScroll, { passive: true, signal: abort.signal });
    onScroll();
  }

  function teardown() {
    trigger?.kill(); trigger = null;
    cancelAnimationFrame(adaptiveFrame); adaptiveFrame = 0;
    constellation?.dispose(); constellation = null;
    abort.abort(); abort = new AbortController();
    section.classList.remove("is-enhanced");
    delete section.dataset.meetComplete;
  }

  function setup(nextMode) {
    teardown();
    mode = nextMode;
    section.dataset.renderState = "idle";
    delete section.dataset.webglFallback;
    if (document.documentElement.dataset.persona !== "visionary") {
      setStaticSemantics();
      section.dataset.renderState = "paused";
      return;
    }
    if (mode === "static" || isPhone()) {
      setStaticSemantics();
      section.dataset.renderState = "fallback";
      return;
    }
    setActive(activeIndex);
    if (mode === "full") setupFull(); else setupAdaptive();
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => setActive(index, { moveScroll: true }), { signal: abort.signal });
      tab.addEventListener("keydown", (event) => {
        let target = index;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) target = (index + 1) % tabs.length;
        else if (["ArrowLeft", "ArrowUp"].includes(event.key)) target = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = tabs.length - 1;
        else return;
        event.preventDefault();
        setActive(target, { moveScroll: true, focus: true });
      }, { signal: abort.signal });
    });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  addEventListener("ezrewards:cinematic-mode", (event) => setup(event.detail.mode));
  const onPersonaChange = (event) => {
    if (event.detail.persona === "visionary") setup(page.dataset.cinematicMode || mode);
    else {
      teardown();
      setStaticSemantics();
      section.dataset.renderState = "paused";
    }
  };
  addEventListener("ezrewards:persona_changed", onPersonaChange);
  addEventListener("ezrewards:persona_selected", onPersonaChange);
  addEventListener("pagehide", teardown, { once: true });
  setup(mode);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initMeetEzRewards, { once: true });
else initMeetEzRewards();
