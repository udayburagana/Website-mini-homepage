import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const claims = new Set();
let lenis = null;
let tick = null;
let listening = false;

export function isSmoothScrollActive() {
  return Boolean(lenis);
}

export function enableSmoothScroll() {
  if (lenis) return lenis;
  lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false });
  lenis.on("scroll", ScrollTrigger.update);
  tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  document.documentElement.dataset.smoothScroll = "lenis";
  return lenis;
}

export function disableSmoothScroll() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
  tick = null;
  delete document.documentElement.dataset.smoothScroll;
}

export function smoothScrollTo(top, { onComplete } = {}) {
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.25, onComplete: () => onComplete?.() });
    return;
  }
  scrollTo({ top, behavior: reducedMotionQuery.matches ? "auto" : "smooth" });
  onComplete?.();
}

// Lenis is one page-wide instance. Each persona registers a predicate and Lenis runs while any
// claim wants it, so personas never toggle the shared instance against each other.
function sync() {
  const wanted = !reducedMotionQuery.matches && [...claims].some((wants) => wants());
  if (wanted) enableSmoothScroll(); else disableSmoothScroll();
}

export function claimSmoothScroll(wants, modeEvent) {
  claims.add(wants);
  addEventListener(modeEvent, sync);
  if (!listening) {
    listening = true;
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ["data-persona"] });
    reducedMotionQuery.addEventListener("change", sync);
    addEventListener("pagehide", disableSmoothScroll, { once: true });
  }
  sync();
}
