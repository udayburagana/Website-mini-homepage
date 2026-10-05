const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = matchMedia("(hover: hover) and (pointer: fine)");

export function initCinematicFooter() {
  const footer = document.querySelector("[data-cinematic-footer]");
  if (!footer) return;
  footer.classList.add("is-enhanced");
  let visible = false, frame = 0, moveHandler = null;

  const render = () => {
    frame = 0;
    if (!visible || reducedMotionQuery.matches || document.documentElement.dataset.persona !== "visionary") return;
    const rect = footer.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (innerHeight - rect.top) / (innerHeight + rect.height)));
    footer.style.setProperty("--footer-progress", progress.toFixed(3));
    footer.style.setProperty("--footer-shift", `${((.5 - progress) * 24).toFixed(2)}px`);
    footer.style.setProperty("--footer-scale", (1.04 - progress * .04).toFixed(3));
  };
  const queue = () => { if (!frame) frame = requestAnimationFrame(render); };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    footer.dataset.footerState = visible ? "visible" : "idle";
    queue();
  }, { rootMargin: "100px", threshold: .08 });
  observer.observe(footer);
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue, { passive: true });

  if (finePointerQuery.matches) {
    moveHandler = (event) => {
      if (!visible || reducedMotionQuery.matches || document.documentElement.dataset.persona !== "visionary") return;
      const rect = footer.getBoundingClientRect();
      footer.style.setProperty("--footer-pointer-x", `${event.clientX - rect.left}px`);
      footer.style.setProperty("--footer-pointer-y", `${event.clientY - rect.top}px`);
    };
    footer.addEventListener("pointermove", moveHandler, { passive: true });
  }

  addEventListener("pagehide", () => {
    observer.disconnect(); cancelAnimationFrame(frame);
    removeEventListener("scroll", queue); removeEventListener("resize", queue);
    if (moveHandler) footer.removeEventListener("pointermove", moveHandler);
  }, { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initCinematicFooter, { once: true });
else initCinematicFooter();
