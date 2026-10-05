const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");

export function initFaqMotion() {
  const root = document.querySelector("[data-faq-motion]");
  if (!root) return;

  const items = [...root.querySelectorAll("[data-faq-item]")];
  const animations = new WeakMap();
  const cleanups = [];

  const finish = (details, open) => {
    details.open = open;
    details.dataset.faqState = open ? "open" : "closed";
    details.dataset.targetOpen = String(open);
    details.style.removeProperty("height");
    details.style.removeProperty("overflow");
    details.querySelector("[data-faq-answer]")?.getAnimations().forEach((animation) => animation.finish());
  };

  const toggle = (details) => {
    const summary = details.querySelector("summary");
    const answer = details.querySelector("[data-faq-answer]");
    const currentlyTargetedOpen = details.dataset.targetOpen === "true";
    const open = !currentlyTargetedOpen;

    animations.get(details)?.cancel();
    answer?.getAnimations().forEach((animation) => animation.cancel());
    details.dataset.targetOpen = String(open);

    if (reducedMotionQuery.matches || !details.animate) {
      finish(details, open);
      return;
    }

    const startHeight = details.getBoundingClientRect().height;
    details.open = true;
    details.style.height = "auto";
    const endHeight = open ? details.scrollHeight : summary.getBoundingClientRect().height;
    details.style.height = `${startHeight}px`;
    details.style.overflow = "clip";
    details.dataset.faqState = "animating";

    const animation = details.animate(
      [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
      { duration: 300, easing: "cubic-bezier(.22, 1, .36, 1)" },
    );
    animations.set(details, animation);

    if (answer) {
      answer.animate(
        open
          ? [{ opacity: 0, transform: "translateY(-8px)" }, { opacity: 1, transform: "translateY(0)" }]
          : [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-6px)" }],
        { duration: 220, easing: "ease-out", fill: "both" },
      );
    }

    animation.onfinish = () => finish(details, open);
    animation.oncancel = () => {
      details.style.removeProperty("height");
      details.style.removeProperty("overflow");
    };
  };

  items.forEach((details) => {
    details.dataset.targetOpen = String(details.open);
    details.dataset.faqState = details.open ? "open" : "closed";
    const summary = details.querySelector("summary");
    const onClick = (event) => {
      event.preventDefault();
      toggle(details);
    };
    summary?.addEventListener("click", onClick);
    cleanups.push(() => summary?.removeEventListener("click", onClick));
  });

  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(({ target }) => {
      const details = target.closest("details");
      if (details?.open && details.dataset.faqState !== "animating") details.style.removeProperty("height");
    });
  });
  items.forEach((details) => {
    const answer = details.querySelector("[data-faq-answer]");
    if (answer) resizeObserver.observe(answer);
  });

  addEventListener("pagehide", () => {
    resizeObserver.disconnect();
    cleanups.forEach((cleanup) => cleanup());
    items.forEach((details) => animations.get(details)?.cancel());
  }, { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initFaqMotion, { once: true });
else initFaqMotion();
