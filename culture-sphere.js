import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { smoothScrollTo } from "./visionary-smooth-scroll.js";
import { createTransparentOutputPass } from "./cinematic-alpha-pass.js";

gsap.registerPlugin(ScrollTrigger);

export const OUTCOMES = ["employee", "team", "leadership", "company"];
export const OUTCOME_ANCHORS = [.11, .38, .65, .9];
const HOLDS = [[0, .22], [.28, .48], [.54, .74], [.8, 1]];
const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const phoneQuery = matchMedia("(max-width: 767px)");
const finePointerQuery = matchMedia("(hover: hover) and (pointer: fine)");
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = (value) => value * value * (3 - 2 * value);

export function cultureStateAt(progress) {
  const p = clamp(progress);
  let index = OUTCOMES.length - 1;
  for (let i = 0; i < HOLDS.length; i += 1) {
    if (p <= HOLDS[i][1]) { index = i; break; }
  }
  const formation = smooth(clamp((p + .02) / .84));
  const participation = smooth(clamp(p / .22));
  const recognition = smooth(clamp((p - .23) / .24));
  const belonging = smooth(clamp((p - .49) / .24));
  const insight = smooth(clamp((p - .74) / .2));
  const brandCore = smooth(clamp((p - .86) / .11));
  return { index, formation, participation, recognition, belonging, insight, brandCore };
}

const seeded = (seed = 60421) => () => {
  seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
  return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
};

function makeSphereData(count) {
  const random = seeded(6226);
  const cloud = new Float32Array(count * 3);
  const sphere = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const clusters = new Float32Array(count);
  const uv = new Float32Array(count * 2);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / Math.max(1, count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const scale = 3.75 + (random() - .5) * .08;
    sphere.set([x * scale, y * scale, z * scale], i * 3);
    const cloudRadius = 4.6 + random() * 4.5;
    const cloudTheta = random() * Math.PI * 2;
    const cloudY = (random() - .5) * 8.5;
    cloud.set([Math.cos(cloudTheta) * cloudRadius, cloudY, Math.sin(cloudTheta) * cloudRadius], i * 3);
    seeds[i] = random();
    clusters[i] = i % 7;
    uv.set([(theta / (Math.PI * 2)) % 1, (y + 1) * .5], i * 2);
  }
  return { cloud, sphere, seeds, clusters, uv };
}

function makeConnections(sphere, count = 720) {
  const positions = new Float32Array(count * 6);
  const total = sphere.length / 3;
  for (let i = 0; i < count; i += 1) {
    const a = Math.floor(i * total / count);
    const b = (a + 34 + (i % 5) * 13) % total;
    positions.set(sphere.subarray(a * 3, a * 3 + 3), i * 6);
    positions.set(sphere.subarray(b * 3, b * 3 + 3), i * 6 + 3);
  }
  return positions;
}

function makeStar(count = 320) {
  const positions = new Float32Array(count * 3);
  const points = [];
  for (let i = 0; i < 8; i += 1) {
    const angle = -Math.PI / 2 + i * Math.PI / 4;
    const radius = i % 2 ? .22 : 1.18;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  for (let i = 0; i < count; i += 1) {
    const edge = i % 8;
    const t = (i / 8 % (count / 8)) / Math.max(1, count / 8 - 1);
    const a = points[edge], b = points[(edge + 1) % 8];
    positions.set([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, .08], i * 3);
  }
  return positions;
}

class CultureRenderer {
  constructor(canvas, full, onFailure) {
    this.canvas = canvas;
    this.full = full;
    this.onFailure = onFailure;
    this.count = full ? 12000 : 5000;
    this.minimumCount = full ? 7000 : 3000;
    this.active = false;
    this.running = false;
    this.frame = 0;
    this.frames = [];
    this.pointer = new THREE.Vector2();
    this.targetPointer = new THREE.Vector2();
    this.uniforms = null;
    try { this.create(); } catch (error) { console.warn("Culture sphere WebGL fallback", error); this.dispose(); onFailure?.(); }
  }

  create() {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, .1, 50);
    this.camera.position.z = 11;
    const data = makeSphereData(this.count);
    this.spherePositions = data.sphere;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(data.cloud, 3));
    geometry.setAttribute("aSphere", new THREE.BufferAttribute(data.sphere, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(data.seeds, 1));
    geometry.setAttribute("aCluster", new THREE.BufferAttribute(data.clusters, 1));
    geometry.setAttribute("aUv", new THREE.BufferAttribute(data.uv, 2));
    this.fluidData = new Uint8Array(64 * 64 * 4);
    this.fluidTexture = new THREE.DataTexture(this.fluidData, 64, 64, THREE.RGBAFormat);
    this.fluidTexture.needsUpdate = true;
    this.uniforms = {
      uTime: { value: 0 }, uFormation: { value: 0 }, uParticipation: { value: 0 }, uRecognition: { value: 0 },
      uBelonging: { value: 0 }, uInsight: { value: 0 }, uBrandCore: { value: 0 }, uPixelRatio: { value: Math.min(devicePixelRatio, 1.25) },
      uPointer: { value: new THREE.Vector2() }, uFluid: { value: this.fluidTexture },
    };
    const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: this.uniforms,
      vertexShader: `
        attribute vec3 aSphere; attribute float aSeed; attribute float aCluster; attribute vec2 aUv;
        uniform float uTime,uFormation,uParticipation,uRecognition,uInsight,uPixelRatio; uniform vec2 uPointer; uniform sampler2D uFluid;
        varying float vSeed,vPulse,vInsight,vVisible,vCluster;
        void main(){
          float fluid=(texture2D(uFluid,aUv).r-.5)*.22;
          vec3 target=aSphere+normalize(aSphere)*fluid*uFormation;
          vec3 p=mix(position,target,uFormation);
          p+=normalize(target)*sin(uTime*.55+aSeed*18.)*.025*uFormation;
          vec2 cursor=uPointer*2.; float proximity=max(0.,1.-distance(p.xy,cursor)); p.xy+=normalize(p.xy-cursor+.001)*proximity*.12;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
          float pulse=pow(max(0.,sin(uTime*2.2-aSeed*10.-length(target)*.9)),8.)*uRecognition;
          gl_PointSize=(1.45+uParticipation*1.3+pulse*3.6+aSeed*.8)*uPixelRatio*(10./-mv.z);
          vSeed=aSeed; vPulse=pulse; vInsight=uInsight; vVisible=step(aSeed, mix(.3,1.,uParticipation)); vCluster=aCluster;
        }`,
      fragmentShader: `
        varying float vSeed,vPulse,vInsight,vVisible,vCluster;
        vec3 mint=vec3(.51,.94,.78), violet=vec3(.77,.65,1.), gold=vec3(1.,.79,.47), teal=vec3(.44,.85,.90);
        void main(){
          vec2 p=gl_PointCoord-.5; float d=length(p); if(d>.5||vVisible<.5)discard;
          vec3 base=mix(mint,teal,step(.52,vSeed));
          vec3 pattern=mix(violet,gold,step(3.5,vCluster));
          vec3 color=mix(base,pattern,vInsight*.72)+vPulse*.85;
          gl_FragColor=vec4(color,(1.-smoothstep(.12,.5,d))*(.34+vPulse*.66));
        }`,
    });
    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(makeConnections(data.sphere), 3));
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0x8de9d1, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    this.lines = new THREE.LineSegments(lineGeometry, this.lineMaterial);
    this.scene.add(this.lines);

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(makeStar(), 3));
    this.starMaterial = new THREE.PointsMaterial({ color: 0xfff2c8, size: .08, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    this.star = new THREE.Points(starGeometry, this.starMaterial);
    this.scene.add(this.star);

    this.rings = [0, 1, 2].map((_, index) => {
      const materialRing = new THREE.MeshBasicMaterial({ color: index === 1 ? 0xc5a6ff : 0x82efc8, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(2.3 + index * .38, 2.33 + index * .38, 96), materialRing);
      mesh.rotation.x = Math.PI / 2.3 + index * .18;
      this.scene.add(mesh); return mesh;
    });

    if (this.full) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .38, .28, .76);
      this.composer.addPass(this.bloom);
      this.composer.addPass(createTransparentOutputPass());
    }
    this.resize();
  }

  setState(state) {
    if (!this.uniforms) return;
    Object.entries(state).forEach(([key, value]) => {
      const uniform = this.uniforms[`u${key[0].toUpperCase()}${key.slice(1)}`];
      if (uniform) uniform.value = value;
    });
    this.lineMaterial.opacity = state.belonging * (.09 + state.insight * .08);
    this.starMaterial.opacity = state.brandCore * .92;
    this.rings.forEach((ring, index) => { ring.material.opacity = state.recognition * (.12 - index * .022); });
  }

  setPointer(x, y) { this.targetPointer.set(x, y); }

  updateFluid(time) {
    if (time - (this.lastFluid || 0) < 66) return;
    this.lastFluid = time;
    const impulseX = (this.pointer.x + 1) * 31.5, impulseY = (this.pointer.y + 1) * 31.5;
    for (let y = 0; y < 64; y += 1) for (let x = 0; x < 64; x += 1) {
      const i = (y * 64 + x) * 4;
      const curl = Math.sin(x * .18 + time * .00022) * Math.cos(y * .16 - time * .00018);
      const pointer = Math.max(0, 1 - Math.hypot(x - impulseX, y - impulseY) / 13);
      const value = 128 + curl * 35 + pointer * 38;
      this.fluidData[i] = value; this.fluidData[i + 1] = value; this.fluidData[i + 2] = value; this.fluidData[i + 3] = 255;
    }
    this.fluidTexture.needsUpdate = true;
  }

  tick = (time) => {
    if (!this.running || !this.renderer) return;
    const start = performance.now();
    this.pointer.lerp(this.targetPointer, .055);
    this.uniforms.uPointer.value.copy(this.pointer);
    this.uniforms.uTime.value = time * .001;
    this.updateFluid(time);
    this.camera.position.x += (this.pointer.x * .1 - this.camera.position.x) * .04;
    this.camera.position.y += (this.pointer.y * .1 - this.camera.position.y) * .04;
    this.points.rotation.y = time * .000035;
    this.lines.rotation.y = this.points.rotation.y;
    this.rings.forEach((ring, index) => { ring.scale.setScalar(1 + ((time * .00018 + index * .22) % .5)); });
    (this.composer || this.renderer).render(this.scene, this.camera);
    this.frames.push(performance.now() - start);
    if (this.frames.length > 90) this.frames.shift();
    if (this.frames.length === 90 && this.count > this.minimumCount && this.frames.reduce((a, b) => a + b, 0) / 90 > 24) {
      this.count = this.minimumCount; this.points.geometry.setDrawRange(0, this.count); this.canvas.closest("[data-culture-sphere]").dataset.performanceTier = "reduced";
    }
    this.frame = requestAnimationFrame(this.tick);
  };

  start() { if (this.running || !this.renderer) return; this.running = true; this.frame = requestAnimationFrame(this.tick); }
  stop() { this.running = false; cancelAnimationFrame(this.frame); }
  resize() {
    if (!this.renderer) return;
    const width = Math.max(1, this.canvas.clientWidth), height = Math.max(1, this.canvas.clientHeight);
    this.renderer.setSize(width, height, false); this.composer?.setSize(width, height);
    this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
  }
  dispose() {
    this.stop();
    this.scene?.traverse((object) => { object.geometry?.dispose(); if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose()); else object.material?.dispose(); });
    this.fluidTexture?.dispose(); this.composer?.dispose(); this.renderer?.dispose();
  }
}

export function initCultureSphere() {
  const section = document.querySelector("[data-culture-sphere]");
  const page = section?.closest(".visionary-refresh");
  if (!section || !page) return;
  const pin = section.querySelector(".cinematic-culture__pin");
  const canvas = section.querySelector("[data-culture-canvas]");
  const visual = section.querySelector(".cinematic-culture__visual");
  const cards = [...section.querySelectorAll("[data-outcome-stage]")];
  const tabs = [...section.querySelectorAll("[data-outcome-progress]")];
  const progress = section.querySelector(".cinematic-culture__progress");
  let activeIndex = 0, mode = "", trigger = null, cardObserver = null, visibilityObserver = null, resizeObserver = null, renderer = null;
  let navigatingTo = null, navigationTimer = 0;
  let abort = new AbortController();

  const modeForPage = () => reducedMotionQuery.matches ? "static" : page.dataset.cinematicMode === "full" ? "pinned" : innerWidth >= 768 ? "flow" : "static";
  const exposeState = (state) => {
    for (const [key, value] of Object.entries(state)) if (key !== "index") section.dataset[`sphere${key[0].toUpperCase()}${key.slice(1)}`] = Number(value).toFixed(3);
    renderer?.setState(state);
  };
  const setActive = (index, { navigate = false, focus = false, force = false } = {}) => {
    const next = clamp(index, 0, OUTCOMES.length - 1);
    if (!force && next === activeIndex && !navigate && !focus) return;
    activeIndex = next; section.dataset.activeOutcome = OUTCOMES[next];
    cards.forEach((card, i) => {
      const active = i === next; card.dataset.outcomeState = active ? "active" : i < next ? "complete" : "upcoming";
      if (mode === "pinned") { card.setAttribute("aria-hidden", String(!active)); if (active) card.removeAttribute("inert"); else card.setAttribute("inert", ""); }
    });
    tabs.forEach((tab, i) => { const active = i === next; tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1; tab.dataset.state = active ? "active" : i < next ? "complete" : "upcoming"; });
    if (focus) tabs[next]?.focus();
    if (navigate && mode === "pinned" && trigger) {
      navigatingTo = next;
      clearTimeout(navigationTimer);
      navigationTimer = setTimeout(() => { navigatingTo = null; }, 1800);
      smoothScrollTo(trigger.start + (trigger.end - trigger.start) * OUTCOME_ANCHORS[next]);
    }
    if (mode !== "pinned") exposeState(cultureStateAt(OUTCOME_ANCHORS[next]));
  };
  const showAll = () => {
    cards.forEach((card) => { card.removeAttribute("role"); card.removeAttribute("aria-labelledby"); card.removeAttribute("aria-hidden"); card.removeAttribute("inert"); card.dataset.outcomeState = "visible"; });
    progress.setAttribute("inert", "");
  };
  const installControls = () => tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setActive(index, { navigate: true, focus: true }), { signal: abort.signal });
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (["ArrowRight", "ArrowDown"].includes(event.key)) next = Math.min(index + 1, 3);
      else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = Math.max(index - 1, 0);
      else if (event.key === "Home") next = 0; else if (event.key === "End") next = 3; else return;
      event.preventDefault(); setActive(next, { navigate: true, focus: true });
    }, { signal: abort.signal });
  });
  const failToSvg = () => { section.dataset.renderState = "fallback"; section.dataset.webglFallback = "true"; renderer = null; };
  const createRenderer = (full) => {
    renderer = new CultureRenderer(canvas, full, failToSvg);
    if (!renderer.renderer) renderer = null;
    section.dataset.particleCount = String(renderer?.count || 0); section.dataset.performanceTier = "full";
    resizeObserver = new ResizeObserver(() => renderer?.resize()); resizeObserver.observe(visual);
    if (finePointerQuery.matches && full) section.addEventListener("pointermove", (event) => {
      const bounds = visual.getBoundingClientRect();
      renderer?.setPointer(clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * 2 - 1, -(clamp((event.clientY - bounds.top) / bounds.height, 0, 1) * 2 - 1));
    }, { signal: abort.signal });
  };
  const setupPinned = () => {
    progress.removeAttribute("inert"); createRenderer(true); installControls();
    cards.forEach((card, i) => { card.setAttribute("role", "tabpanel"); card.setAttribute("aria-labelledby", tabs[i].id); });
    setActive(activeIndex, { force: true }); exposeState(cultureStateAt(0));
    const header = document.querySelector(".site-header");
    trigger = ScrollTrigger.create({ trigger: section, start: () => `top ${header?.offsetHeight || 76}px`, end: () => `bottom-=${pin.offsetHeight} ${header?.offsetHeight || 76}px`, scrub: .55, invalidateOnRefresh: true,
      onUpdate: ({ progress: amount }) => {
        const state = cultureStateAt(amount); exposeState(state);
        if (navigatingTo !== null && Math.abs(amount - OUTCOME_ANCHORS[navigatingTo]) < .025) { clearTimeout(navigationTimer); navigatingTo = null; }
        setActive(navigatingTo ?? state.index);
        section.style.setProperty("--culture-progress", amount.toFixed(4));
      },
    });
  };
  const setupFlow = () => {
    showAll(); createRenderer(false); installControls(); setActive(activeIndex, { force: true });
    cardObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(cards.indexOf(entry.target)); }), { rootMargin: "-30% 0px -42%", threshold: .01 });
    cards.forEach((card) => cardObserver.observe(card));
  };
  const teardown = () => {
    trigger?.kill(); trigger = null; cardObserver?.disconnect(); cardObserver = null; visibilityObserver?.disconnect(); visibilityObserver = null; resizeObserver?.disconnect(); resizeObserver = null;
    renderer?.dispose(); renderer = null; abort.abort(); abort = new AbortController(); section.style.removeProperty("--culture-progress");
    clearTimeout(navigationTimer); navigatingTo = null;
  };
  const setup = (nextMode = modeForPage()) => {
    teardown(); mode = nextMode; section.dataset.sphereMode = mode; delete section.dataset.webglFallback; section.dataset.renderState = "idle";
    if (document.documentElement.dataset.persona !== "visionary") { showAll(); section.dataset.renderState = "paused"; return; }
    if (mode === "pinned") setupPinned(); else if (mode === "flow") setupFlow(); else { showAll(); exposeState(cultureStateAt(1)); }
    visibilityObserver = new IntersectionObserver(([entry]) => {
      if (section.dataset.renderState === "fallback") return;
      section.dataset.renderState = entry.isIntersecting ? "active" : "paused";
      if (entry.isIntersecting) renderer?.start(); else renderer?.stop();
    }, { rootMargin: "300px" }); visibilityObserver.observe(section);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  addEventListener("ezrewards:cinematic-mode", () => setup(modeForPage()));
  const personaChanged = (event) => setup(event.detail.persona === "visionary" ? modeForPage() : "static");
  addEventListener("ezrewards:persona_changed", personaChanged); addEventListener("ezrewards:persona_selected", personaChanged);
  reducedMotionQuery.addEventListener("change", () => setup(modeForPage())); phoneQuery.addEventListener("change", () => setup(modeForPage()));
  const personaObserver = new MutationObserver(() => setup(modeForPage())); personaObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-persona"] });
  addEventListener("pagehide", () => { personaObserver.disconnect(); teardown(); }, { once: true }); setup();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initCultureSphere, { once: true });
else initCultureSphere();
