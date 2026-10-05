import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createTransparentOutputPass } from "./cinematic-alpha-pass.js";

gsap.registerPlugin(ScrollTrigger);

const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const phoneQuery = matchMedia("(max-width: 767px)");
const finePointerQuery = matchMedia("(hover: hover) and (pointer: fine)");
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value) => value * value * (3 - 2 * value);

export function finalCtaStateAt(progress) {
  const value = clamp(progress);
  return {
    headline: smooth(clamp(value / .25)),
    formation: smooth(clamp((value - .25) / .43)),
    settle: smooth(clamp((value - .68) / .14)),
    action: smooth(clamp((value - .82) / .14)),
  };
}

const seeded = (seed = 1907) => () => {
  seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
  return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
};

function createPositions(count) {
  const random = seeded();
  const dispersed = new Float32Array(count * 3);
  const star = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const vertices = [];
  for (let index = 0; index < 8; index += 1) {
    const angle = -Math.PI / 2 + index * Math.PI / 4;
    const radius = index % 2 ? .72 : 3.05;
    vertices.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  const palette = [new THREE.Color(0x82efc8), new THREE.Color(0xc5a6ff), new THREE.Color(0xffcf83)];
  for (let index = 0; index < count; index += 1) {
    const radius = 3.6 + random() * 4.7;
    const theta = random() * Math.PI * 2;
    dispersed.set([Math.cos(theta) * radius, (random() - .5) * 7.4, (random() - .5) * 4.2], index * 3);
    const edge = Math.floor(random() * 8);
    const amount = random();
    const a = vertices[edge], b = vertices[(edge + 1) % 8];
    const inward = Math.sqrt(random());
    star.set([(a[0] + (b[0] - a[0]) * amount) * inward, (a[1] + (b[1] - a[1]) * amount) * inward, (random() - .5) * .24], index * 3);
    const color = palette[index % palette.length];
    colors.set([color.r, color.g, color.b], index * 3);
  }
  return { dispersed, star, colors };
}

class FinalRenderer {
  constructor(canvas, full, onFailure) {
    this.canvas = canvas;
    this.full = full;
    this.count = full ? 2800 : 1400;
    this.onFailure = onFailure;
    this.running = false;
    this.visible = false;
    this.progress = 1;
    this.pointer = new THREE.Vector2();
    this.pointerTarget = new THREE.Vector2();
    try { this.create(); } catch (error) { console.warn("Final CTA WebGL fallback", error); this.dispose(); onFailure?.(); }
  }

  create() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, .1, 40);
    this.camera.position.z = 10.5;
    const data = createPositions(this.count);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(data.dispersed, 3));
    geometry.setAttribute("aTarget", new THREE.BufferAttribute(data.star, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(data.colors, 3));
    this.uniforms = {
      uTime: { value: 0 },
      uFormation: { value: 1 },
      uSettle: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
      uPixelRatio: { value: Math.min(devicePixelRatio, 1.25) },
    };
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: this.uniforms,
      vertexShader: `
        attribute vec3 aTarget; attribute vec3 aColor;
        uniform float uTime,uFormation,uSettle,uPixelRatio; uniform vec2 uPointer;
        varying vec3 vColor; varying float vAlpha;
        void main(){
          float drift=(1.-uFormation)*sin(uTime*.32+position.x*.7+position.y*.45)*.16;
          vec3 p=mix(position,aTarget,uFormation); p.z+=drift;
          p.xy+=uPointer*(.08*(.25+.75*uFormation));
          float breath=1.+sin(uTime*1.1)*.018*(1.-uSettle); p.xy*=breath;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
          gl_PointSize=(2.4+uFormation*1.7)*uPixelRatio*(10./-mv.z);
          vColor=aColor; vAlpha=.32+uFormation*.58;
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main(){ vec2 p=gl_PointCoord-.5; float d=length(p); if(d>.5)discard; gl_FragColor=vec4(vColor,(1.-smoothstep(.08,.5,d))*vAlpha); }`,
    });
    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);
    if (this.full) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), .28, .24, .8));
      this.composer.addPass(createTransparentOutputPass());
    }
    this.resize();
  }

  setProgress(progress) {
    this.progress = progress;
    const state = finalCtaStateAt(progress);
    if (this.uniforms) {
      this.uniforms.uFormation.value = state.formation;
      this.uniforms.uSettle.value = state.settle;
    }
  }

  setPointer(x, y) { this.pointerTarget.set(x, y); }

  resize() {
    if (!this.renderer) return;
    const width = Math.max(1, this.canvas.clientWidth), height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setSize(width, height, false);
    this.composer?.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  start() { if (!this.running && this.renderer) { this.running = true; this.clock = performance.now(); this.frame = requestAnimationFrame((time) => this.render(time)); } }
  stop() { this.running = false; cancelAnimationFrame(this.frame); }
  render(time) {
    if (!this.running) return;
    const delta = Math.min(48, time - this.clock); this.clock = time;
    this.uniforms.uTime.value += delta / 1000;
    this.pointer.lerp(this.pointerTarget, .08);
    this.uniforms.uPointer.value.copy(this.pointer);
    this.composer ? this.composer.render() : this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame((next) => this.render(next));
  }
  dispose() {
    this.stop();
    this.points?.geometry.dispose(); this.points?.material.dispose();
    this.composer?.dispose(); this.renderer?.dispose();
  }
}

export function initFinalCta() {
  const section = document.querySelector("[data-final-cta]");
  const page = section?.closest(".visionary-refresh");
  if (!section || !page) return;
  const canvas = section.querySelector("canvas");
  const action = section.querySelector("a");
  let renderer = null, trigger = null, observer = null, visibilityObserver = null, resizeObserver = null;
  let moveHandler = null, mode = "static";

  const modeForPage = () => reducedMotionQuery.matches || phoneQuery.matches ? "static" : page.dataset.cinematicMode === "full" ? "pinned" : "flow";
  const paint = (progress) => {
    const state = finalCtaStateAt(progress);
    section.dataset.finalCtaProgress = progress.toFixed(3);
    section.style.setProperty("--final-headline", state.headline.toFixed(3));
    section.style.setProperty("--final-formation", state.formation.toFixed(3));
    section.style.setProperty("--final-action", state.action.toFixed(3));
    renderer?.setProgress(progress);
    if (state.action > .75) action.removeAttribute("inert"); else action.setAttribute("inert", "");
  };
  const fallback = () => { section.dataset.renderState = "fallback"; renderer?.dispose(); renderer = null; };

  const teardown = () => {
    trigger?.kill(); trigger = null;
    observer?.disconnect(); observer = null;
    visibilityObserver?.disconnect(); visibilityObserver = null;
    resizeObserver?.disconnect(); resizeObserver = null;
    if (moveHandler) section.removeEventListener("pointermove", moveHandler);
    moveHandler = null;
    renderer?.dispose(); renderer = null;
    section.classList.remove("is-enhanced");
    action.removeAttribute("inert");
  };

  const setup = (nextMode = modeForPage()) => {
    teardown(); mode = nextMode; section.dataset.finalCtaMode = mode;
    const isVisionary = document.documentElement.dataset.persona === "visionary";
    if (!isVisionary || mode === "static") { paint(1); fallback(); return; }

    section.classList.add("is-enhanced");
    section.dataset.renderState = "idle";
    renderer = new FinalRenderer(canvas, mode === "pinned", fallback);
    if (!renderer?.renderer) return;
    section.dataset.renderState = "paused";
    resizeObserver = new ResizeObserver(() => renderer?.resize()); resizeObserver.observe(canvas);
    visibilityObserver = new IntersectionObserver(([entry]) => {
      if (!renderer) return;
      if (entry.isIntersecting) { renderer.start(); section.dataset.renderState = "active"; }
      else { renderer.stop(); section.dataset.renderState = "paused"; }
    }, { rootMargin: "300px" });
    visibilityObserver.observe(section);

    if (finePointerQuery.matches) {
      moveHandler = (event) => {
        const rect = section.getBoundingClientRect();
        renderer?.setPointer(((event.clientX - rect.left) / rect.width - .5) * 2, -((event.clientY - rect.top) / rect.height - .5) * 2);
      };
      section.addEventListener("pointermove", moveHandler, { passive: true });
    }

    if (mode === "pinned") {
      paint(0);
      trigger = ScrollTrigger.create({ trigger: section, start: "top top+=76", end: "bottom bottom", scrub: true, onUpdate: (self) => paint(self.progress) });
    } else {
      paint(0);
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const proxy = { value: 0 };
        gsap.to(proxy, { value: 1, duration: 1.8, ease: "power2.out", onUpdate: () => paint(proxy.value) });
      }, { threshold: .25 });
      observer.observe(section);
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  addEventListener("ezrewards:cinematic-mode", () => setup(modeForPage()));
  const personaChanged = (event) => setup(event.detail.persona === "visionary" ? modeForPage() : "static");
  addEventListener("ezrewards:persona_changed", personaChanged);
  addEventListener("ezrewards:persona_selected", personaChanged);
  reducedMotionQuery.addEventListener("change", () => setup(modeForPage()));
  phoneQuery.addEventListener("change", () => setup(modeForPage()));
  const personaObserver = new MutationObserver(() => setup(modeForPage()));
  personaObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-persona"] });
  addEventListener("pagehide", () => { personaObserver.disconnect(); teardown(); }, { once: true });
  setup();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initFinalCta, { once: true });
else initFinalCta();
