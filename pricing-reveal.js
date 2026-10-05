import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");

export function initPricingReveal() {
  const section = document.querySelector("[data-pricing-reveal]");
  const page = section?.closest(".visionary-refresh");
  if (!section || !page) return;

  const intro = section.querySelector("[data-pricing-intro]");
  const card = section.querySelector("[data-pricing-card]");
  const price = section.querySelector("[data-price-value]");
  const period = section.querySelector("[data-price-period]");
  const border = section.querySelector(".cinematic-pricing__border");
  const features = [...section.querySelectorAll("[data-price-feature]")];
  const checks = features.map((feature) => feature.querySelector("span"));
  const actions = section.querySelector("[data-pricing-actions]");
  const notes = [...section.querySelectorAll("[data-pricing-note]")];
  let trigger = null, observer = null, context = null, mode = "", hasPlayed = false;

  const modeForPage = () => reducedMotionQuery.matches ? "static" : page.dataset.cinematicMode === "full" ? "animated" : "adaptive";

  const clearInline = () => gsap.set([intro, card, price, period, border, ...features, ...checks, actions, ...notes], { clearProps: "all" });
  const showComplete = () => {
    clearInline();
    actions.removeAttribute("inert");
    section.classList.add("is-enhanced");
    section.dataset.pricingState = "complete";
    section.style.setProperty("--pricing-border-turn", "360deg");
    section.style.setProperty("--pricing-border-opacity", ".22");
  };

  const buildTimeline = (adaptive = false) => {
    const distance = adaptive ? 30 : 56;
    const blur = adaptive ? 8 : 14;
    let timeline;
    context = gsap.context(() => {
      timeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.out" },
        onStart: () => {
          section.dataset.pricingState = "entering";
          actions.removeAttribute("inert");
        },
        onComplete: () => {
          hasPlayed = true;
          section.dataset.pricingState = "complete";
          section.style.setProperty("--pricing-border-opacity", ".22");
          card.style.removeProperty("will-change");
          price.style.removeProperty("will-change");
        },
      });
      timeline
        .fromTo(intro, { y: adaptive ? 20 : 30, opacity: 0 }, { y: 0, opacity: 1, duration: adaptive ? .48 : .62 }, 0)
        .fromTo(card, { y: distance, scale: .975, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: adaptive ? .58 : .76 }, .16)
        .fromTo(price,
          { filter: `blur(${blur}px)`, opacity: .18, letterSpacing: ".08em", color: "rgba(246,244,237,0)", webkitTextStroke: "1px rgba(246,244,237,.5)" },
          { filter: "blur(0px)", opacity: 1, letterSpacing: "-.065em", color: "#f6f4ed", webkitTextStroke: "0px transparent", duration: adaptive ? .56 : .78 }, .3)
        .fromTo(period, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .45 }, .44)
        .fromTo(border, { opacity: 0 }, { opacity: .78, duration: .3 }, .38)
        .fromTo(section, { "--pricing-border-turn": "0deg" }, { "--pricing-border-turn": "360deg", duration: adaptive ? 1.15 : 1.75, ease: "none" }, .38)
        .to(border, { opacity: .22, duration: .38 }, adaptive ? 1.2 : 1.7)
        .fromTo(features, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .4, stagger: adaptive ? .035 : .052 }, .54)
        .fromTo(checks, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .28, stagger: adaptive ? .035 : .052, ease: "back.out(1.5)" }, .5)
        .fromTo(actions, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .48 }, adaptive ? .88 : 1.05)
        .fromTo(notes, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .48, stagger: .1 }, adaptive ? .96 : 1.18);
      card.style.willChange = "transform, opacity";
      price.style.willChange = "filter, opacity";
    }, section);
    return timeline;
  };

  const setupAnimated = () => {
    section.classList.add("is-enhanced");
    section.dataset.pricingState = "idle";
    actions.setAttribute("inert", "");
    const timeline = buildTimeline(false);
    trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 72%",
      once: true,
      onEnter: () => timeline.play(0),
    });
  };
  const setupAdaptive = () => {
    section.classList.add("is-enhanced");
    section.dataset.pricingState = "idle";
    actions.setAttribute("inert", "");
    const timeline = buildTimeline(true);
    observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      timeline.play(0);
    }, { rootMargin: "0px 0px -18%", threshold: .12 });
    observer.observe(section);
  };
  const teardown = () => {
    trigger?.kill(); trigger = null;
    observer?.disconnect(); observer = null;
    context?.revert(); context = null;
    section.classList.remove("is-enhanced");
    actions.removeAttribute("inert");
    section.style.removeProperty("--pricing-border-turn");
    section.style.removeProperty("--pricing-border-opacity");
  };
  const setup = (nextMode = modeForPage()) => {
    teardown(); mode = nextMode; section.dataset.pricingMode = mode;
    if (document.documentElement.dataset.persona !== "visionary" || mode === "static" || hasPlayed) { showComplete(); return; }
    if (mode === "animated") setupAnimated(); else setupAdaptive();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  addEventListener("ezrewards:cinematic-mode", () => setup(modeForPage()));
  const personaChanged = (event) => setup(event.detail.persona === "visionary" ? modeForPage() : "static");
  addEventListener("ezrewards:persona_changed", personaChanged);
  addEventListener("ezrewards:persona_selected", personaChanged);
  reducedMotionQuery.addEventListener("change", () => setup(modeForPage()));
  const personaObserver = new MutationObserver(() => setup(modeForPage()));
  personaObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-persona"] });
  addEventListener("pagehide", () => { personaObserver.disconnect(); teardown(); }, { once: true });
  setup();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initPricingReveal, { once: true });
else initPricingReveal();
