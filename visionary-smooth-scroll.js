import { claimSmoothScroll } from "./cinematic-smooth-scroll.js";

export { isSmoothScrollActive, enableSmoothScroll, disableSmoothScroll, smoothScrollTo } from "./cinematic-smooth-scroll.js";

// Lenis runs only for the Visionary persona in full cinematic desktop mode.
export function initVisionarySmoothScroll() {
  const page = document.querySelector(".visionary-refresh");
  if (!page) return;
  claimSmoothScroll(
    () => document.documentElement.dataset.persona === "visionary" && page.dataset.cinematicMode === "full",
    "ezrewards:cinematic-mode",
  );
}
