(() => {
  const views = [...document.querySelectorAll("[data-experience-view]")];
  const personalityButton = document.querySelector('[data-personality="visionary"]');
  const enterButton = document.querySelector("[data-enter-visionary]");
  const loaderProgress = document.querySelector("[data-loader-progress]");
  const loaderBar = document.querySelector("[data-loader-bar]");
  const loaderMeter = loaderProgress?.closest('[role="progressbar"]');

  function showView(name) {
    views.forEach((view) => {
      view.hidden = view.dataset.experienceView !== name;
    });
  }

  function selectPersonality(name) {
    if (name !== "visionary" || !personalityButton || !enterButton) return;
    personalityButton.setAttribute("aria-pressed", "true");
    enterButton.disabled = false;
  }

  function updateProgress(value) {
    if (!loaderProgress || !loaderBar || !loaderMeter) return;
    loaderProgress.value = `${value}%`;
    loaderProgress.textContent = `${value}%`;
    loaderBar.style.width = `${value}%`;
    loaderMeter.setAttribute("aria-valuenow", String(value));
  }

  function startVisionaryExperience() {
    if (!enterButton || enterButton.disabled) return;
    showView("loader");
    updateProgress(0);
    document.querySelector("#loader-title")?.focus();
    const startedAt = performance.now();
    const duration = 2000;
    function tick(now) {
      const elapsed = Math.min(now - startedAt, duration);
      updateProgress(Math.round((elapsed / duration) * 100));
      if (elapsed < duration) {
        requestAnimationFrame(tick);
        return;
      }
      showView("home");
      initDarkExperience();
      document.querySelector(".dark-hero h1")?.focus();
    }
    requestAnimationFrame(tick);
  }

  function initDarkExperience() {
    const home = document.querySelector(".dark-visionary");
    if (!home || home.dataset.motionReady === "true") return;
    home.dataset.motionReady = "true";

    const reveals = [...home.querySelectorAll("[data-dark-reveal]")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((item) => item.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
      reveals.forEach((item) => revealObserver.observe(item));
    }

    const orbit = home.querySelector("[data-dark-parallax]");
    if (!orbit || reducedMotion) return;
    orbit.addEventListener("pointermove", (event) => {
      const bounds = orbit.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - .5) * 14;
      const y = ((event.clientY - bounds.top) / bounds.height - .5) * 10;
      orbit.style.setProperty("--orbit-x", `${x.toFixed(2)}px`);
      orbit.style.setProperty("--orbit-y", `${y.toFixed(2)}px`);
    });
    orbit.addEventListener("pointerleave", () => {
      orbit.style.setProperty("--orbit-x", "0px");
      orbit.style.setProperty("--orbit-y", "0px");
    });
  }

  function setMenu(toggle, open) {
    const menu = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    toggle.textContent = open ? "Close" : "Menu";
    menu.classList.toggle("is-open", open);
  }

  document.addEventListener("click", (event) => {
    const personality = event.target.closest("[data-personality]");
    if (personality && !personality.disabled) {
      selectPersonality(personality.dataset.personality);
      return;
    }

    if (event.target.closest("[data-enter-visionary]")) {
      startVisionaryExperience();
      return;
    }

    if (event.target.closest("[data-change-experience]")) {
      showView("entry");
      personalityButton?.focus();
      return;
    }

    const toggle = event.target.closest("[data-menu-toggle]");
    if (toggle) {
      setMenu(toggle, toggle.getAttribute("aria-expanded") !== "true");
      return;
    }

    const menuLink = event.target.closest(".primary-navigation a");
    if (menuLink) {
      const openToggle = document.querySelector('[data-menu-toggle][aria-expanded="true"]');
      if (openToggle) setMenu(openToggle, false);
    }

    const submitButton = event.target.closest("form[data-demo-form] button");
    if (submitButton) {
      const form = submitButton.closest("form");
      const status = form.querySelector(".demo-form-status");
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        form.reportValidity();
        if (status) status.textContent = "Please complete the required fields.";
      } else if (status) {
        status.textContent = "";
      }
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const toggle = document.querySelector('[data-menu-toggle][aria-expanded="true"]');
    if (toggle) {
      setMenu(toggle, false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 767) {
      const toggle = document.querySelector('[data-menu-toggle][aria-expanded="true"]');
      if (toggle) setMenu(toggle, false);
    }
  });
})();
