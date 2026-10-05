import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { claimSmoothScroll, smoothScrollTo } from "./cinematic-smooth-scroll.js";
import { PhoneParticles } from "./operator-phone-particles.js";
import {
  CATEGORY_ANCHORS, CAPABILITY_ANCHORS, OUTCOME_ANCHORS,
  clamp, stageAt, loopStageAt, operatorMode, isPinnedMode, visionBeatsAt, accessTicksAt, problemCardsAt,
} from "./operator-anchors.mjs";

gsap.registerPlugin(ScrollTrigger);

// Per-item accents, applied to borders, icon washes and rail indicators only — never to body text.
const ACCENTS = ["#38bdf8", "#2dd4bf", "#c2f24a", "#fbbf24", "#a78bfa", "#7dd3fc", "#5eead4", "#8bdcff"];
const INTRO_KEY = "ezrewards-operator-intro";
const SECTION_ORDER = ["hero", "problem", "vision", "category", "loop", "capabilities", "outcomes", "early-access", "pricing", "faq", "final-cta"];

const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
const fullQuery = matchMedia("(min-width: 1200px) and (min-height: 760px)");
// Anything shorter cannot pin a stage under the header, so it keeps the reveal layout.
const compactQuery = matchMedia("(min-height: 560px)");
const finePointerQuery = matchMedia("(hover: hover) and (pointer: fine)");
const pad = (value) => String(value).padStart(2, "0");

const generated = (tag, className, attributes = {}) => {
  const node = document.createElement(tag);
  node.className = className;
  node.dataset.operatorGenerated = "";
  Object.entries(attributes).forEach(([name, value]) => node.setAttribute(name, value));
  return node;
};

// A DPR-aware canvas whose draw loop only runs while its section is on screen.
function createSceneCanvas(host, className, draw) {
  const canvas = generated("canvas", `operator-scene-canvas ${className}`, { "aria-hidden": "true" });
  host.append(canvas);
  const context = canvas.getContext("2d");
  if (!context) { canvas.remove(); return null; }
  let width = 1;
  let height = 1;
  let frame = 0;
  let running = false;
  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const loop = (time) => {
    if (!running) return;
    context.clearRect(0, 0, width, height);
    draw(context, width, height, time, canvas);
    frame = requestAnimationFrame(loop);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) { running = true; frame = requestAnimationFrame(loop); }
    else if (!entry.isIntersecting) { running = false; cancelAnimationFrame(frame); }
  }, { rootMargin: "200px" });
  visibility.observe(canvas);
  resize();
  return {
    destroy() {
      running = false;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      canvas.remove();
    },
  };
}

function initOperatorCinematic() {
  const page = document.querySelector("[data-operator-cinematic]");
  if (!page) return;

  const header = document.querySelector(".site-header");
  const headerHeight = () => header?.offsetHeight || 76;
  const sectionNamed = (name) => page.querySelector(`[data-operator-section="${name}"]`);
  const isActive = () => !page.hidden && !page.inert && document.documentElement.dataset.persona === "operator";
  let mode = "";

  page.dataset.operatorEngine = "console-cinematic";

  const pinOf = (section) => section.querySelector("[data-operator-pin]") || section.querySelector(":scope > .operator-scene-pin, :scope > .operator-wrap");

  // In compact mode the intro scrolls away and only the stage pins: the stage nodes move into a
  // sticky pin inside a static holder tall enough to provide the scroll range. The holder, not the
  // sticky pin, is measured for scroll positions (a stuck element reports shifted offsets).
  const mountCompactPin = (section, nodes, room) => {
    const holder = document.createElement("div");
    holder.className = "operator-compact-stage";
    holder.dataset.operatorStageHolder = "";
    holder.style.setProperty("--oc-room", room);
    const pin = document.createElement("div");
    pin.className = "operator-compact-pin";
    pin.dataset.operatorPin = "";
    nodes[0].before(holder);
    holder.append(pin);
    pin.append(...nodes);
    return () => { nodes.forEach((node) => holder.before(node)); holder.remove(); };
  };

  // ScrollTrigger spanning the time the scene's pin is stuck under the header (0 → 1).
  const pinnedProgress = (section, onUpdate) => {
    const pin = pinOf(section);
    const range = section.querySelector("[data-operator-stage-holder]") || section;
    return ScrollTrigger.create({
      trigger: range,
      start: () => `top ${headerHeight()}px`,
      end: () => `bottom-=${pin.offsetHeight} ${headerHeight()}px`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        section.style.setProperty("--oc-progress", self.progress.toFixed(4));
        onUpdate(self.progress);
      },
      onRefresh: (self) => onUpdate(self.progress),
    });
  };

  // Pinned cards are governed by stage state, not by the generic reveal observer.
  const markRevealed = (root) => root.querySelectorAll("[data-operator-reveal]").forEach((node) => node.classList.add("is-visible"));

  /* ---------- 01 Hero: console boot, pointer tilt, scroll de-tilt ---------- */
  function createHero() {
    const section = sectionNamed("hero");
    const workspace = section.querySelector(".operator-workspace");
    let trigger = null;
    let timeline = null;
    let abort = new AbortController();
    let pointerFrame = 0;

    const boot = () => {
      if (sessionStorage.getItem(INTRO_KEY)) return;
      sessionStorage.setItem(INTRO_KEY, "true");
      timeline = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: () => { timeline = null; } });
      timeline
        .from(workspace, { y: 40, opacity: 0, duration: .9, clearProps: "opacity" })
        .from(workspace.querySelectorAll(".operator-windowbar i"), { scale: 0, opacity: 0, stagger: .08, duration: .3, clearProps: "all" }, "-=.45")
        .from(workspace.querySelectorAll(".operator-app aside > *"), { x: -14, opacity: 0, stagger: .05, duration: .4, clearProps: "all" }, "-=.2")
        .from(workspace.querySelector(".operator-app__feed article"), { y: 22, opacity: 0, duration: .55, clearProps: "all" }, "-=.25")
        .from(workspace.querySelectorAll(".operator-app__feed > i"), { scaleX: 0, transformOrigin: "left", stagger: .1, duration: .5, clearProps: "all" }, "-=.3")
        .from(section.querySelectorAll(".operator-statuses span"), { y: 12, opacity: 0, stagger: .1, duration: .45, clearProps: "all" }, "-=.4");
    };

    return {
      setup(nextMode) {
        if (nextMode === "static") return;
        boot();
        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => section.style.setProperty("--oc-hero-scroll", self.progress.toFixed(4)),
        });
        if (nextMode !== "full" || !finePointerQuery.matches) return;
        section.addEventListener("pointermove", (event) => {
          if (pointerFrame) return;
          pointerFrame = requestAnimationFrame(() => {
            pointerFrame = 0;
            const bounds = section.getBoundingClientRect();
            section.style.setProperty("--oc-tilt-x", (clamp((event.clientX - bounds.left) / bounds.width) - .5).toFixed(3));
            section.style.setProperty("--oc-tilt-y", (clamp((event.clientY - bounds.top) / bounds.height) - .5).toFixed(3));
          });
        }, { signal: abort.signal });
        section.addEventListener("pointerleave", () => {
          section.style.setProperty("--oc-tilt-x", "0");
          section.style.setProperty("--oc-tilt-y", "0");
        }, { signal: abort.signal });
      },
      teardown() {
        trigger?.kill(); trigger = null;
        timeline?.progress(1).kill(); timeline = null;
        abort.abort(); abort = new AbortController();
        cancelAnimationFrame(pointerFrame); pointerFrame = 0;
        ["--oc-hero-scroll", "--oc-tilt-x", "--oc-tilt-y"].forEach((name) => section.style.removeProperty(name));
      },
    };
  }

  /* ---------- 02 Problem: four fragmented cards rise into a fanned row ---------- */
  function createProblem() {
    const section = sectionNamed("problem");
    const cards = [...section.querySelectorAll(".operator-grid > article")];
    let trigger = null;
    cards.forEach((card, index) => {
      card.style.setProperty("--oc-index", String(index));
      card.style.setProperty("--oc-accent", ACCENTS[index]);
    });
    const update = (progress) => {
      const shown = problemCardsAt(progress);
      cards.forEach((card, index) => { card.dataset.cardState = index < shown ? "in" : "waiting"; });
      section.dataset.problemCards = String(shown);
    };
    let unmount = null;
    return {
      setup(nextMode) {
        section.dataset.sceneMode = nextMode === "full" ? "pinned" : nextMode;
        if (!isPinnedMode(nextMode)) return;
        markRevealed(section);
        if (nextMode === "compact") unmount = mountCompactPin(section, [section.querySelector(".operator-grid")], "200svh");
        update(0);
        trigger = pinnedProgress(section, update);
      },
      teardown() {
        trigger?.kill(); trigger = null;
        unmount?.(); unmount = null;
        cards.forEach((card) => delete card.dataset.cardState);
        delete section.dataset.problemCards;
        section.style.removeProperty("--oc-progress");
      },
    };
  }

  /* ---------- 03 Vision: question, answer and principle arrive in three beats ---------- */
  function createVision() {
    const section = sectionNamed("vision");
    const beats = [...section.querySelectorAll(".operator-vision-grid > div"), section.querySelector("blockquote")];
    let trigger = null;
    const update = (progress) => {
      const passed = visionBeatsAt(progress);
      beats.forEach((beat, index) => { beat.dataset.beatState = index <= passed ? "in" : "waiting"; });
      section.dataset.visionSettled = String(passed >= 3);
    };
    return {
      setup(nextMode) {
        section.dataset.sceneMode = nextMode === "full" ? "pinned" : nextMode;
        if (!isPinnedMode(nextMode)) return;
        markRevealed(section);
        update(0);
        trigger = pinnedProgress(section, update);
      },
      teardown() {
        trigger?.kill(); trigger = null;
        beats.forEach((beat) => delete beat.dataset.beatState);
        delete section.dataset.visionSettled;
        section.style.removeProperty("--oc-progress");
      },
    };
  }

  /* ---------- 04–07 Staged scenes: a tablist rail drives one active panel ---------- */
  // Equilateral triangle sized to the stage so a card centred on any vertex stays inside it.
  // Vertices run clockwise from the top: top, bottom-right, bottom-left.
  function triangleLayout(list, cards, isCompact = () => false) {
    let vertices = [];
    let observer = null;
    let activeIndex = 0;
    const place = () => {
      const [x, y] = vertices[activeIndex] || [0, 0];
      list.style.setProperty("--oc-ax", `${x.toFixed(1)}px`);
      list.style.setProperty("--oc-ay", `${y.toFixed(1)}px`);
    };
    const measure = () => {
      const width = list.clientWidth;
      const height = list.clientHeight;
      const cardWidth = Math.max(...cards.map((card) => card.offsetWidth));
      const cardHeight = Math.max(...cards.map((card) => card.offsetHeight));
      const compact = isCompact();
      const band = compact ? Math.max(90, Math.min(170, height - cardHeight - 36)) : height;
      const side = compact
        ? Math.max(0, Math.min(width * .78, (band - 44) * 2 / Math.sqrt(3)))
        : Math.max(0, Math.min(width - cardWidth, (height - cardHeight) * 2 / Math.sqrt(3)));
      const rise = side * Math.sqrt(3) / 2;
      const top = (band - rise) / 2;
      const center = width / 2;
      vertices = [[center, top], [center + side / 2, top + rise], [center - side / 2, top + rise]];
      cards.forEach((card, index) => {
        card.style.setProperty("--oc-vx", `${vertices[index][0].toFixed(1)}px`);
        card.style.setProperty("--oc-vy", `${vertices[index][1].toFixed(1)}px`);
      });
      place();
    };
    return {
      // Vertices relative to another element (the canvas) that shares the stage cell.
      verticesIn(element) {
        const from = list.getBoundingClientRect();
        const to = element.getBoundingClientRect();
        return vertices.map(([x, y]) => [x + from.left - to.left, y + from.top - to.top]);
      },
      start() {
        observer = new ResizeObserver(measure);
        observer.observe(list);
        cards.forEach((card) => observer.observe(card));
        measure();
      },
      setActive(index) { activeIndex = index; place(); },
      stop() {
        observer?.disconnect(); observer = null;
        ["--oc-ax", "--oc-ay"].forEach((property) => list.style.removeProperty(property));
        cards.forEach((card) => ["--oc-vx", "--oc-vy"].forEach((property) => card.style.removeProperty(property)));
      },
    };
  }

  function createStageScene({ name, cardSelector, anchors, railLabel, labelFor, drawCanvas, triangle = false, phone = false, plainRail = false }) {
    const section = sectionNamed(name);
    const wrap = section.querySelector(":scope > .operator-wrap");
    const cards = [...section.querySelectorAll(cardSelector)];
    const list = cards[0].parentElement;
    const rail = generated("div", "operator-rail", { role: "tablist", "aria-label": railLabel, "aria-orientation": "vertical" });
    let trigger = null;
    let canvas = null;
    let abort = new AbortController();
    let activeIndex = 0;
    let sceneMode = "static";
    let unmount = null;
    const layout = triangle ? triangleLayout(list, cards, () => sceneMode === "compact") : null;
    // A decorative phone whose screen morphs a particle illustration per point (full mode only).
    const phoneEl = phone ? generated("div", "operator-phone", { "aria-hidden": "true" }) : null;
    if (phoneEl) {
      phoneEl.innerHTML = '<div class="operator-phone__frame"><i class="operator-phone__notch"></i><div class="operator-phone__screen"><canvas></canvas></div></div>';
      phoneEl.hidden = true;
    }
    const phoneScreen = phoneEl?.querySelector(".operator-phone__screen");
    let particles = null;

    const tabs = cards.map((card, index) => {
      card.id ||= `operator-${name}-panel-${index}`;
      card.dataset.stageItem = String(index);
      card.style.setProperty("--oc-accent", ACCENTS[index % ACCENTS.length]);
      const tab = generated("button", "operator-rail__tab", {
        type: "button", role: "tab", id: `operator-${name}-tab-${index}`, "aria-controls": card.id,
      });
      tab.style.setProperty("--oc-accent", ACCENTS[index % ACCENTS.length]);
      tab.innerHTML = `<span aria-hidden="true">${pad(index + 1)}</span><b></b>`;
      tab.querySelector("b").textContent = labelFor(card);
      rail.append(tab);
      return tab;
    });
    rail.hidden = true;
    if (plainRail) rail.classList.add("operator-rail--plain");
    list.before(rail);
    if (phoneEl) list.before(phoneEl);
    const stage = generated("div", "operator-stage-glow", { "aria-hidden": "true" });
    list.before(stage);

    const installPhonePointer = () => {
      if (!finePointerQuery.matches) return;
      let frame = 0;
      wrap.addEventListener("pointermove", (event) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          const bounds = wrap.getBoundingClientRect();
          phoneEl.style.setProperty("--oc-phone-x", (clamp((event.clientX - bounds.left) / bounds.width) - .5).toFixed(3));
          phoneEl.style.setProperty("--oc-phone-y", (clamp((event.clientY - bounds.top) / bounds.height) - .5).toFixed(3));
          const screen = phoneScreen.getBoundingClientRect();
          const x = (event.clientX - screen.left) / screen.width;
          const y = (event.clientY - screen.top) / screen.height;
          if (x >= -.15 && x <= 1.15 && y >= -.1 && y <= 1.1) particles?.setPointer(x, y); else particles?.setPointer(null);
        });
      }, { signal: abort.signal });
      wrap.addEventListener("pointerleave", () => {
        phoneEl.style.setProperty("--oc-phone-x", "0");
        phoneEl.style.setProperty("--oc-phone-y", "0");
        particles?.setPointer(null);
      }, { signal: abort.signal });
    };

    const setActive = (index, { navigate = false, focus = false, force = false } = {}) => {
      const next = clamp(index, 0, cards.length - 1);
      if (!force && next === activeIndex && !navigate && !focus) return;
      activeIndex = next;
      section.dataset.activeStage = String(activeIndex);
      section.style.setProperty("--oc-accent", ACCENTS[activeIndex % ACCENTS.length]);
      layout?.setActive(activeIndex);
      particles?.setStage(activeIndex, { instant: particles.stage < 0 });
      cards.forEach((card, cardIndex) => {
        const active = cardIndex === activeIndex;
        card.dataset.stageState = active ? "active" : cardIndex < activeIndex ? "past" : "future";
        card.setAttribute("aria-hidden", String(!active));
        if (active) card.removeAttribute("inert"); else card.setAttribute("inert", "");
      });
      tabs.forEach((tab, tabIndex) => {
        const active = tabIndex === activeIndex;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        tab.dataset.state = active ? "active" : tabIndex < activeIndex ? "complete" : "upcoming";
      });
      if (focus) tabs[activeIndex]?.focus();
      if (navigate && trigger) {
        const top = trigger.start + (trigger.end - trigger.start) * anchors[activeIndex];
        smoothScrollTo(top, { onComplete: () => setActive(activeIndex, { force: true }) });
      }
    };

    const showAll = () => {
      rail.hidden = true;
      rail.setAttribute("inert", "");
      if (list.getAttribute("role") === "presentation") list.removeAttribute("role");
      cards.forEach((card) => {
        ["role", "aria-labelledby", "aria-hidden", "inert"].forEach((attribute) => card.removeAttribute(attribute));
        delete card.dataset.stageState;
      });
      delete section.dataset.activeStage;
    };

    return {
      section,
      setActive,
      setup(nextMode) {
        sceneMode = nextMode;
        section.dataset.sceneMode = nextMode === "full" ? "pinned" : nextMode;
        showAll();
        if (!isPinnedMode(nextMode)) return;
        markRevealed(section);
        if (nextMode === "compact") unmount = mountCompactPin(section, [rail, phoneEl, stage, list].filter(Boolean), `${Math.round(anchors.length * 55)}svh`);
        rail.hidden = false;
        rail.removeAttribute("inert");
        // Tabpanels cannot remain direct children of a semantic list.
        if (list.matches("ol, ul")) list.setAttribute("role", "presentation");
        cards.forEach((card, index) => {
          card.setAttribute("role", "tabpanel");
          card.setAttribute("aria-labelledby", tabs[index].id);
        });
        layout?.start();
        if (phoneEl) {
          phoneEl.hidden = false;
          particles = new PhoneParticles({
            host: phoneScreen, canvas: phoneScreen.querySelector("canvas"), colors: ACCENTS,
            onState: (state) => { section.dataset.renderState = state; },
            onFailure: () => {
              particles = null;
              phoneEl.hidden = true;
              section.dataset.renderState = "fallback";
              section.dataset.webglFallback = "true";
            },
          });
          if (particles?.renderer) {
            section.dataset.particleCount = String(particles.count);
            installPhonePointer();
          }
        }
        setActive(activeIndex, { force: true });
        trigger = pinnedProgress(section, (progress) => setActive(stageAt(anchors, progress)));
        tabs.forEach((tab, index) => {
          tab.addEventListener("click", () => setActive(index, { navigate: true, focus: true }), { signal: abort.signal });
          tab.addEventListener("keydown", (event) => {
            let next = index;
            if (["ArrowRight", "ArrowDown"].includes(event.key)) next = Math.min(index + 1, tabs.length - 1);
            else if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = Math.max(index - 1, 0);
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault();
            setActive(next, { navigate: true, focus: true });
          }, { signal: abort.signal });
        });
        if (drawCanvas) canvas = createSceneCanvas(pinOf(section), `operator-scene-canvas--${name}`, (context, width, height, time, element) => drawCanvas(context, width, height, time, activeIndex, cards.length, layout?.verticesIn(element), sceneMode));
      },
      teardown() {
        trigger?.kill(); trigger = null;
        canvas?.destroy(); canvas = null;
        layout?.stop();
        particles?.dispose(); particles = null;
        unmount?.(); unmount = null;
        if (phoneEl) {
          phoneEl.hidden = true;
          ["--oc-phone-x", "--oc-phone-y"].forEach((property) => phoneEl.style.removeProperty(property));
          ["renderState", "particleCount", "webglFallback"].forEach((key) => delete section.dataset[key]);
        }
        abort.abort(); abort = new AbortController();
        section.style.removeProperty("--oc-progress");
        if (sceneMode === "full") showAll();
      },
    };
  }

  /* ---------- 05 Loop: workflow steps stack into a deck as the page scrolls ---------- */
  // Each arriving card lands one header-height below the last, so every earlier step keeps its
  // number and title visible above the newest card. The list keeps its <ol> semantics throughout.
  function createStackScene() {
    const section = sectionNamed("loop");
    const list = section.querySelector(".operator-steps");
    const cards = [...list.children];
    let trigger = null;
    let activeIndex = -1;
    list.style.setProperty("--oc-count", String(cards.length));
    cards.forEach((card, index) => {
      card.dataset.stageItem = String(index);
      card.style.setProperty("--oc-index", String(index));
      card.style.setProperty("--oc-accent", ACCENTS[index % ACCENTS.length]);
    });
    const setActive = (index) => {
      if (index === activeIndex) return;
      activeIndex = index;
      section.dataset.activeStage = String(index);
      section.style.setProperty("--oc-accent", ACCENTS[index % ACCENTS.length]);
      cards.forEach((card, cardIndex) => {
        card.dataset.stackState = cardIndex === index ? "active" : cardIndex < index ? "stacked" : "waiting";
      });
    };
    let unmount = null;
    return {
      setup(nextMode) {
        section.dataset.sceneMode = nextMode === "full" ? "pinned" : nextMode;
        if (!isPinnedMode(nextMode)) return;
        markRevealed(section);
        if (nextMode === "compact") unmount = mountCompactPin(section, [list], "280svh");
        setActive(0);
        trigger = pinnedProgress(section, (progress) => setActive(loopStageAt(progress)));
      },
      teardown() {
        trigger?.kill(); trigger = null;
        unmount?.(); unmount = null;
        activeIndex = -1;
        cards.forEach((card) => delete card.dataset.stackState);
        delete section.dataset.activeStage;
        section.style.removeProperty("--oc-progress");
      },
    };
  }

  // Category: three capabilities joined into one connected system. The nodes are the same
  // equilateral vertices the pillar cards are centred on, so the active card sits on its node.
  const drawConnectedSystem = (context, width, height, time, active, total, nodes) => {
    if (!nodes?.length) return;
    const centerX = (nodes[0][0] + nodes[1][0] + nodes[2][0]) / 3;
    const centerY = (nodes[0][1] + nodes[1][1] + nodes[2][1]) / 3;
    context.lineWidth = 1;
    nodes.forEach(([x, y], index) => {
      const [nx, ny] = nodes[(index + 1) % 3];
      context.strokeStyle = "rgba(139, 220, 255, .22)";
      context.beginPath(); context.moveTo(x, y); context.lineTo(nx, ny); context.stroke();
      context.strokeStyle = "rgba(139, 220, 255, .08)";
      context.beginPath(); context.moveTo(x, y); context.lineTo(centerX, centerY); context.stroke();
      // Signals run from the centre out to the active vertex.
      const travel = ((time * .00035) + index / 3) % 1;
      const [tx, ty] = nodes[active];
      context.fillStyle = "rgba(56, 189, 248, .8)";
      context.beginPath(); context.arc(centerX + (tx - centerX) * travel, centerY + (ty - centerY) * travel, 2, 0, Math.PI * 2); context.fill();
    });
    nodes.forEach(([x, y], index) => {
      const isActive = index === active;
      const pulse = isActive ? 10 + Math.sin(time * .004) * 4 : 0;
      context.fillStyle = isActive ? "rgba(56, 189, 248, .14)" : "rgba(139, 220, 255, .05)";
      context.beginPath(); context.arc(x, y, 28 + pulse, 0, Math.PI * 2); context.fill();
      context.strokeStyle = isActive ? "rgba(56, 189, 248, .85)" : "rgba(139, 220, 255, .28)";
      context.beginPath(); context.arc(x, y, 18, 0, Math.PI * 2); context.stroke();
    });
    context.fillStyle = "rgba(194, 242, 74, .7)";
    context.beginPath(); context.arc(centerX, centerY, 3.2, 0, Math.PI * 2); context.fill();
  };

  // Outcomes: an operational mesh that widens ring by ring as each outcome is reached.
  const drawOperationalMesh = (context, width, height, time, active, total, _nodes, sceneMode) => {
    const centerX = width * .5;
    const centerY = height * (sceneMode === "compact" ? .34 : .5);
    const maxRadius = Math.min(width, height * (sceneMode === "compact" ? .6 : 1)) * .46;
    for (let ring = 0; ring < total; ring += 1) {
      const reached = ring <= active;
      const radius = maxRadius * (ring + 1) / total;
      context.strokeStyle = reached ? `rgba(45, 212, 191, ${.32 - ring * .05})` : "rgba(139, 220, 255, .06)";
      context.lineWidth = 1;
      context.beginPath(); context.arc(centerX, centerY, radius, 0, Math.PI * 2); context.stroke();
      const count = 6 + ring * 4;
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2 + time * .00008 * (ring % 2 ? -1 : 1);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        context.fillStyle = reached ? "rgba(94, 234, 212, .78)" : "rgba(139, 220, 255, .14)";
        context.beginPath(); context.arc(x, y, reached ? 1.9 : 1.2, 0, Math.PI * 2); context.fill();
        if (reached && index % 3 === 0) {
          context.strokeStyle = "rgba(94, 234, 212, .07)";
          context.beginPath(); context.moveTo(centerX, centerY); context.lineTo(x, y); context.stroke();
        }
      }
    }
  };

  /* ---------- 08 Early access: benefits are checked off one at a time ---------- */
  function createEarlyAccess() {
    const section = sectionNamed("early-access");
    const items = [...section.querySelectorAll(".operator-access li")];
    let trigger = null;
    items.forEach((item, index) => item.style.setProperty("--oc-index", String(index)));
    const update = (progress) => {
      const ticked = accessTicksAt(progress);
      items.forEach((item, index) => { item.dataset.tickState = index < ticked ? "done" : "pending"; });
    };
    let observer = null;
    return {
      setup(nextMode) {
        section.dataset.sceneMode = nextMode === "full" ? "pinned" : nextMode;
        if (nextMode === "compact") {
          update(0);
          observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { update(1); observer?.disconnect(); observer = null; } }, { threshold: .35 });
          observer.observe(section.querySelector(".operator-access ul"));
          return;
        }
        if (nextMode !== "full") return;
        update(0);
        trigger = pinnedProgress(section, update);
      },
      teardown() {
        trigger?.kill(); trigger = null;
        observer?.disconnect(); observer = null;
        items.forEach((item) => delete item.dataset.tickState);
        section.style.removeProperty("--oc-progress");
      },
    };
  }

  /* ---------- 09 Pricing: one calm reveal, played once ---------- */
  function createPricing() {
    const section = sectionNamed("pricing");
    const card = section.querySelector(".operator-pricing");
    card.querySelectorAll("li").forEach((item, index) => item.style.setProperty("--oc-index", String(index)));
    let observer = null;
    return {
      setup(nextMode) {
        if (section.dataset.pricingState === "revealed") return;
        if (nextMode === "static") { section.dataset.pricingState = "revealed"; return; }
        section.dataset.pricingState = "armed";
        observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return;
          section.dataset.pricingState = "revealed";
          observer?.disconnect(); observer = null;
        }, { threshold: .2 });
        observer.observe(card);
      },
      teardown() {
        observer?.disconnect(); observer = null;
        if (section.dataset.pricingState === "armed") section.dataset.pricingState = "revealed";
      },
    };
  }

  /* ---------- 10 FAQ: animated disclosure that keeps native <details> semantics ---------- */
  function createFaq() {
    const section = sectionNamed("faq");
    const items = [...section.querySelectorAll("details")];
    let abort = new AbortController();
    const finish = (details, open) => {
      details.open = open;
      details.dataset.faqState = open ? "open" : "closed";
      details.style.removeProperty("height");
      details.style.removeProperty("overflow");
    };
    const toggle = (details) => {
      const summary = details.querySelector("summary");
      const answer = details.querySelector(":scope > p");
      const open = details.dataset.faqState !== "open";
      details.getAnimations().forEach((animation) => animation.cancel());
      const startHeight = details.getBoundingClientRect().height;
      details.open = true;
      const endHeight = open ? details.scrollHeight : summary.getBoundingClientRect().height;
      details.style.overflow = "clip";
      details.dataset.faqState = open ? "open" : "closing";
      const animation = details.animate([{ height: `${startHeight}px` }, { height: `${endHeight}px` }], { duration: 320, easing: "cubic-bezier(.22, 1, .36, 1)" });
      answer?.animate(open
        ? [{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "none" }]
        : [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-6px)" }], { duration: 240, easing: "ease-out", fill: "both" });
      animation.onfinish = () => finish(details, open);
    };
    return {
      setup(nextMode) {
        items.forEach((details) => { details.dataset.faqState = details.open ? "open" : "closed"; });
        if (nextMode === "static") return;
        items.forEach((details) => {
          details.querySelector("summary").addEventListener("click", (event) => {
            event.preventDefault();
            toggle(details);
          }, { signal: abort.signal });
        });
      },
      teardown() {
        abort.abort(); abort = new AbortController();
        items.forEach((details) => {
          details.getAnimations().forEach((animation) => animation.finish());
          finish(details, details.open);
        });
      },
    };
  }

  /* ---------- 11 Final CTA: a signal pulse resolves into one horizon line ---------- */
  function createFinal() {
    const section = sectionNamed("final-cta");
    let canvas = null;
    let trigger = null;
    return {
      setup(nextMode) {
        if (nextMode === "static") return;
        trigger = ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "center center",
          onUpdate: (self) => section.style.setProperty("--oc-final-progress", self.progress.toFixed(4)),
        });
        canvas = createSceneCanvas(section, "operator-scene-canvas--final", (context, width, height, time) => {
          const centerX = width / 2;
          const centerY = height * .52;
          for (let ring = 0; ring < 4; ring += 1) {
            const phase = ((time * .00018) + ring / 4) % 1;
            context.strokeStyle = `rgba(56, 189, 248, ${(1 - phase) * .2})`;
            context.lineWidth = 1;
            context.beginPath(); context.ellipse(centerX, centerY, phase * width * .48, phase * height * .32, 0, 0, Math.PI * 2); context.stroke();
          }
        });
      },
      teardown() {
        trigger?.kill(); trigger = null;
        canvas?.destroy(); canvas = null;
        section.style.removeProperty("--oc-final-progress");
      },
    };
  }

  /* ---------- Chapter rail: eleven text-free ticks tracking the current section ---------- */
  function createChapterRail() {
    const rail = generated("div", "operator-chapters", { "aria-hidden": "true" });
    rail.innerHTML = SECTION_ORDER.map(() => "<i></i>").join("");
    rail.hidden = true;
    page.append(rail);
    const ticks = [...rail.children];
    let triggers = [];
    return {
      setup(nextMode) {
        if (nextMode !== "full") return;
        rail.hidden = false;
        triggers = SECTION_ORDER.map((name, index) => ScrollTrigger.create({
          trigger: sectionNamed(name),
          start: "top center",
          end: "bottom center",
          onToggle: (self) => { if (self.isActive) ticks.forEach((tick, tickIndex) => { tick.dataset.state = tickIndex === index ? "active" : tickIndex < index ? "complete" : "upcoming"; }); },
        }));
      },
      teardown() {
        triggers.forEach((trigger) => trigger.kill()); triggers = [];
        rail.hidden = true;
      },
    };
  }

  const scenes = [
    createHero(),
    createProblem(),
    createVision(),
    createStageScene({ name: "category", cardSelector: ".operator-grid > article", anchors: CATEGORY_ANCHORS, railLabel: "Meet EzRewards", labelFor: (card) => card.querySelector("h3").textContent, drawCanvas: drawConnectedSystem, triangle: true }),
    createStackScene(),
    createStageScene({ name: "capabilities", cardSelector: ".operator-capabilities > article", anchors: CAPABILITY_ANCHORS, railLabel: "Capabilities", labelFor: (card) => card.querySelector("small").textContent, phone: true, plainRail: true }),
    createStageScene({ name: "outcomes", cardSelector: ".operator-grid > article", anchors: OUTCOME_ANCHORS, railLabel: "Outcomes", labelFor: (card) => card.querySelector("small").textContent, drawCanvas: drawOperationalMesh }),
    createEarlyAccess(),
    createPricing(),
    createFaq(),
    createFinal(),
    createChapterRail(),
  ];

  const apply = () => {
    page.style.setProperty("--oc-header-height", `${headerHeight()}px`);
    const next = operatorMode({ reduced: reducedQuery.matches, full: fullQuery.matches, compact: compactQuery.matches, active: isActive() });
    page.dataset.animationState = next === "static" ? "paused" : "active";
    // ScrollTrigger is shared with Visionary through the split chunk; only refresh while Operator
    // owns triggers, so an inactive Operator never recomputes another persona's scenes.
    const refresh = () => { if (mode !== "static") ScrollTrigger.refresh(); };
    if (next === mode) { refresh(); return; }
    const hadTriggers = mode && mode !== "static";
    scenes.forEach((scene) => scene.teardown());
    mode = next;
    page.dataset.operatorMode = mode;
    scenes.forEach((scene) => scene.setup(mode));
    dispatchEvent(new CustomEvent("ezrewards:operator-mode", { detail: { mode } }));
    if (mode !== "static" || hadTriggers) requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  [reducedQuery, fullQuery, compactQuery].forEach((query) => query.addEventListener("change", apply));
  const pageObserver = new MutationObserver(apply);
  pageObserver.observe(page, { attributes: true, attributeFilter: ["hidden", "inert"] });
  const personaObserver = new MutationObserver(apply);
  personaObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-persona"] });
  let resizeFrame = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => page.style.setProperty("--oc-header-height", `${headerHeight()}px`));
  }, { passive: true });
  document.fonts?.ready.then(() => { if (mode && mode !== "static") ScrollTrigger.refresh(); });
  addEventListener("pagehide", () => {
    pageObserver.disconnect();
    personaObserver.disconnect();
    scenes.forEach((scene) => scene.teardown());
  }, { once: true });

  claimSmoothScroll(() => isActive() && mode === "full" && finePointerQuery.matches, "ezrewards:operator-mode");
  apply();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initOperatorCinematic, { once: true });
else initOperatorCinematic();
