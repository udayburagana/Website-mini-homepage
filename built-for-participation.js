import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { smoothScrollTo } from "./visionary-smooth-scroll.js";

gsap.registerPlugin(ScrollTrigger);

export const CAPABILITIES = ["recognition", "ai-message", "feed", "catalogue", "assignment", "onboarding", "reporting", "assistant"];
export const CAPABILITY_ANCHORS = [.04, .17, .30, .43, .56, .69, .82, .95];

const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = matchMedia("(hover: hover) and (pointer: fine)");
const phoneQuery = matchMedia("(max-width: 767px)");
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function capabilityAt(progress) {
  const value = clamp(progress);
  for (let index = 0; index < CAPABILITY_ANCHORS.length - 1; index += 1) {
    const boundary = (CAPABILITY_ANCHORS[index] + CAPABILITY_ANCHORS[index + 1]) / 2;
    if (value < boundary) return index;
  }
  return CAPABILITIES.length - 1;
}

function microTimeline(screen, name) {
  const timeline = gsap.timeline({ paused: true, defaults: { duration: .5, ease: "power2.out" } });
  if (name === "recognition") {
    timeline.fromTo(screen.querySelector(".product-person i"), { scale: .72, opacity: .4 }, { scale: 1, opacity: 1 })
      .fromTo(screen.querySelector("button"), { boxShadow: "0 0 0 rgba(130,239,200,0)" }, { boxShadow: "0 0 24px rgba(130,239,200,.28)" }, "<.12");
  } else if (name === "ai-message") {
    timeline.fromTo(screen.querySelector(".product-spark"), { scale: .3, rotate: -30, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1 })
      .fromTo(screen.querySelector(".product-suggestion"), { y: 24, opacity: 0 }, { y: 0, opacity: 1 }, "<.15")
      .to(screen.querySelector(".product-cursor"), { opacity: 0, repeat: 3, yoyo: true, duration: .24 });
  } else if (name === "feed") {
    timeline.fromTo(screen.querySelectorAll(".product-float-reactions i"), { y: 20, scale: .4, opacity: 0 }, { y: -18, scale: 1, opacity: 1, stagger: .1 })
      .to(screen.querySelectorAll(".product-float-reactions i"), { y: -34, opacity: 0, stagger: .08, duration: .42 });
  } else if (name === "catalogue") {
    timeline.fromTo(screen.querySelector(".product-reward-grid .is-featured"), { y: 12, scale: .95 }, { y: -8, scale: 1 })
      .fromTo(screen.querySelector(".product-gift-lid"), { y: 4, rotate: -5 }, { y: -8, rotate: 6, yoyo: true, repeat: 1 }, "<");
  } else if (name === "assignment") {
    timeline.fromTo(screen.querySelectorAll(".product-people .is-selected em"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: .15, ease: "back.out(1.8)" })
      .fromTo(screen.querySelectorAll(".product-selection span"), { x: -10, opacity: 0 }, { x: 0, opacity: 1, stagger: .1 }, "<.12");
  } else if (name === "onboarding") {
    timeline.fromTo(screen.querySelector(".product-onboarding-options em"), { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: .85 })
      .fromTo(screen.querySelector(".product-onboarding-options strong"), { opacity: 0, x: 8 }, { opacity: 1, x: 0 });
  } else if (name === "reporting") {
    timeline.fromTo(screen.querySelectorAll(".product-report-chart > i"), { scaleY: 0, transformOrigin: "bottom" }, { scaleY: 1, stagger: .07 })
      .fromTo(screen.querySelector(".product-report-chart path"), { strokeDasharray: 500, strokeDashoffset: 500 }, { strokeDashoffset: 0, duration: .9 }, "<.1");
  } else if (name === "assistant") {
    timeline.fromTo(screen.querySelector(".product-query span"), { x: -8, opacity: 0 }, { x: 0, opacity: 1 })
      .fromTo(screen.querySelector(".product-answer"), { y: 20, opacity: 0 }, { y: 0, opacity: 1 }, "<.14")
      .fromTo(screen.querySelectorAll(".product-answer div span"), { x: -12, opacity: 0 }, { x: 0, opacity: 1, stagger: .1 }, "<.18");
  }
  return timeline;
}

export function initBuiltForParticipation() {
  const section = document.querySelector("[data-built-participation]");
  const page = section?.closest(".visionary-refresh");
  if (!section || !page) return;

  const pin = section.querySelector(".cinematic-participation__pin");
  const cards = [...section.querySelectorAll("[data-capability-feature]")];
  const screens = [...section.querySelectorAll("[data-capability-screen]")];
  const tabs = [...section.querySelectorAll("[data-capability-progress]")];
  const progressRail = section.querySelector(".cinematic-participation__progress");
  const product = section.querySelector(".participation-product");
  let mode = "";
  let activeIndex = 0;
  let trigger = null;
  let observer = null;
  let visibilityObserver = null;
  let timeline = null;
  let abort = new AbortController();
  let pointerFrame = 0;
  let isVisible = false;

  const modeForPage = () => {
    if (reducedMotionQuery.matches) return "static";
    if (page.dataset.cinematicMode === "full") return "pinned";
    return innerWidth >= 768 ? "flow" : "static";
  };

  const showAll = () => {
    cards.forEach((card, index) => {
      card.removeAttribute("role");
      card.removeAttribute("aria-labelledby");
      card.removeAttribute("aria-hidden");
      card.removeAttribute("inert");
      card.dataset.cardState = "visible";
      card.style.setProperty("--card-distance", "0");
      screens[index].setAttribute("aria-hidden", "true");
      screens[index].removeAttribute("inert");
    });
    progressRail.setAttribute("inert", "");
  };

  const playActiveTimeline = () => {
    timeline?.kill();
    timeline = null;
    if (mode !== "pinned" || reducedMotionQuery.matches || !isVisible) return;
    timeline = microTimeline(screens[activeIndex], CAPABILITIES[activeIndex]);
    timeline.play(0);
  };

  const setActive = (index, { navigate = false, focus = false, force = false } = {}) => {
    const next = clamp(index, 0, CAPABILITIES.length - 1);
    if (!force && next === activeIndex && !navigate && !focus) return;
    activeIndex = next;
    const activeName = CAPABILITIES[activeIndex];
    section.dataset.activeCapability = activeName;
    cards.forEach((card, cardIndex) => {
      const active = cardIndex === activeIndex;
      const distance = cardIndex - activeIndex;
      card.dataset.cardState = active ? "active" : distance < 0 ? "past" : "future";
      card.dataset.cardSide = cardIndex % 2 === 0 ? "left" : "right";
      card.style.setProperty("--card-distance", String(Math.min(Math.abs(distance), 3)));
      card.setAttribute("aria-hidden", String(!active));
      if (active) card.removeAttribute("inert"); else card.setAttribute("inert", "");
    });
    screens.forEach((screen, screenIndex) => {
      const active = screenIndex === activeIndex;
      screen.dataset.screenState = active ? "active" : screenIndex < activeIndex ? "past" : "future";
      screen.setAttribute("aria-hidden", String(!active));
      if (active) screen.removeAttribute("inert"); else screen.setAttribute("inert", "");
    });
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === activeIndex;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.dataset.state = active ? "active" : tabIndex < activeIndex ? "complete" : "upcoming";
    });
    if (focus) tabs[activeIndex]?.focus();
    playActiveTimeline();
    if (navigate && mode === "pinned" && trigger) {
      const top = trigger.start + (trigger.end - trigger.start) * CAPABILITY_ANCHORS[activeIndex];
      smoothScrollTo(top, { onComplete: () => setActive(activeIndex, { force: true }) });
    }
  };

  const installControls = () => {
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
  };

  const installPointerLight = () => {
    if (!finePointerQuery.matches) return;
    section.addEventListener("pointermove", (event) => {
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const bounds = section.getBoundingClientRect();
        const x = clamp((event.clientX - bounds.left) / Math.max(bounds.width, 1));
        const y = clamp((event.clientY - bounds.top) / Math.max(bounds.height, 1));
        section.style.setProperty("--participation-light-x", `${x * 100}%`);
        section.style.setProperty("--participation-light-y", `${clamp(y, .15, .85) * 100}%`);
        section.style.setProperty("--participation-shift-x", `${(x - .5) * 120}px`);
        section.style.setProperty("--participation-shift-y", `${(y - .5) * 120}px`);
      });
    }, { signal: abort.signal });
    section.addEventListener("pointerleave", () => {
      section.style.setProperty("--participation-light-x", "50%");
      section.style.setProperty("--participation-light-y", "50%");
      section.style.setProperty("--participation-shift-x", "0px");
      section.style.setProperty("--participation-shift-y", "0px");
    }, { signal: abort.signal });
  };

  const setupPinned = () => {
    section.classList.add("is-enhanced");
    progressRail.removeAttribute("inert");
    cards.forEach((card, index) => {
      card.setAttribute("role", "tabpanel");
      card.setAttribute("aria-labelledby", tabs[index].id);
    });
    setActive(activeIndex, { force: true });
    const header = document.querySelector(".site-header");
    trigger = ScrollTrigger.create({
      trigger: section,
      start: () => `top ${header?.offsetHeight || 76}px`,
      end: () => `bottom-=${pin.offsetHeight} ${header?.offsetHeight || 76}px`,
      scrub: .55,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        section.style.setProperty("--participation-progress", self.progress.toFixed(4));
        setActive(capabilityAt(self.progress));
      },
    });
    installControls();
    installPointerLight();
  };

  const setupFlow = () => {
    showAll();
    cards.forEach((card) => card.classList.remove("is-revealed"));
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-revealed");
      });
    }, { threshold: .14 });
    cards.forEach((card) => observer.observe(card));
  };

  const teardown = () => {
    trigger?.kill(); trigger = null;
    observer?.disconnect(); observer = null;
    visibilityObserver?.disconnect(); visibilityObserver = null;
    timeline?.kill(); timeline = null;
    abort.abort(); abort = new AbortController();
    cancelAnimationFrame(pointerFrame); pointerFrame = 0;
    section.classList.remove("is-enhanced");
    section.style.removeProperty("--participation-progress");
    product.style.removeProperty("transform");
  };

  const setup = (nextMode = modeForPage()) => {
    teardown();
    mode = nextMode;
    section.dataset.participationMode = mode;
    section.dataset.animationState = "idle";
    if (document.documentElement.dataset.persona !== "visionary") {
      showAll();
      section.dataset.animationState = "paused";
      return;
    }
    visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      section.dataset.animationState = isVisible ? "active" : "paused";
      if (!isVisible) timeline?.pause();
      else if (mode === "pinned") playActiveTimeline();
    }, { rootMargin: "300px" });
    visibilityObserver.observe(section);
    if (mode === "pinned") setupPinned();
    else if (mode === "flow") setupFlow();
    else showAll();
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

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initBuiltForParticipation, { once: true });
else initBuiltForParticipation();
