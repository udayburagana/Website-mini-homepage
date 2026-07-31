(() => {
  const views = [...document.querySelectorAll("[data-experience-view]")];
  const personalityButtons = [...document.querySelectorAll("[data-personality]")];
  const enterButton = document.querySelector("[data-enter-visionary]");
  const loaderView = document.querySelector('[data-experience-view="loader"]');
  const loaderKicker = document.querySelector("[data-loader-kicker]");
  const loaderPersonality = document.querySelector("[data-loader-personality]");
  const loaderMessage = document.querySelector("[data-loader-message]");
  const loaderProgress = document.querySelector("[data-loader-progress]");
  const loaderBar = document.querySelector("[data-loader-bar]");
  const loaderMeter = loaderProgress?.closest('[role="progressbar"]');
  const skipLink = document.querySelector(".skip-link");
  let selectedPersonality = null;

  const mainTargets = {
    entry: "entry-main",
    loader: "loader-title",
    "visionary-home": "visionary-main",
    "strategist-home": "strategist-main",
    "operator-home": "operator-main"
  };

  const loaderContent = {
    visionary: {
      kicker: "Shaping your experience",
      personality: "Visionary.",
      message: "Preparing a more human way to see recognition."
    },
    strategist: {
      kicker: "Preparing your evidence",
      personality: "Strategist.",
      message: "Building your business case with clear culture signals."
    },
    operator: {
      kicker: "Optimizing your workflow",
      personality: "Operator.",
      message: "Mapping a faster workflow for setup, rewards, wallet, and reports."
    }
  };

  function showView(name) {
    views.forEach((view) => {
      view.hidden = view.dataset.experienceView !== name;
    });
    if (skipLink && mainTargets[name]) skipLink.href = `#${mainTargets[name]}`;
    document.querySelectorAll('[data-menu-toggle][aria-expanded="true"]').forEach((toggle) => {
      setMenu(toggle, false);
    });
  }

  function selectPersonality(name) {
    if (!loaderContent[name] || !enterButton) return;
    selectedPersonality = name;
    personalityButtons.forEach((button) => {
      if (!button.disabled) button.setAttribute("aria-pressed", String(button.dataset.personality === name));
    });
    enterButton.disabled = false;
    enterButton.firstChild.textContent = `Continue as ${name[0].toUpperCase()}${name.slice(1)} `;
  }

  function updateProgress(value) {
    if (!loaderProgress || !loaderBar || !loaderMeter) return;
    loaderProgress.value = `${value}%`;
    loaderProgress.textContent = `${value}%`;
    loaderBar.style.width = `${value}%`;
    loaderMeter.setAttribute("aria-valuenow", String(value));
  }

  function startSelectedExperience() {
    if (!enterButton || enterButton.disabled || !selectedPersonality) return;
    const content = loaderContent[selectedPersonality];
    if (loaderView) loaderView.dataset.loaderTheme = selectedPersonality;
    if (loaderKicker) loaderKicker.textContent = content.kicker;
    if (loaderPersonality) loaderPersonality.textContent = content.personality;
    if (loaderMessage) loaderMessage.textContent = content.message;
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
      showView(`${selectedPersonality}-home`);
      if (selectedPersonality === "visionary") initDarkExperience();
      if (selectedPersonality === "strategist") initStrategistExperience();
      if (selectedPersonality === "operator") initOperatorExperience();
      document.querySelector(`[data-experience-view="${selectedPersonality}-home"] h1`)?.focus();
    }
    requestAnimationFrame(tick);
  }

  function initStrategistExperience() {
    const home = document.querySelector(".strategist-home");
    if (!home || home.dataset.motionReady === "true") return;
    home.dataset.motionReady = "true";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = [...home.querySelectorAll("[data-strategist-reveal]")];

    function animateKpi(element) {
      if (element.dataset.counted === "true") return;
      element.dataset.counted = "true";
      const target = Number(element.dataset.kpiTarget);
      const suffix = element.dataset.kpiSuffix || "";
      if (!Number.isFinite(target) || reducedMotion) return;
      const decimals = String(target).includes(".") ? 1 : 0;
      const startedAt = performance.now();
      const duration = 650;
      function count(now) {
        const progress = Math.min((now - startedAt) / duration, 1);
        const value = target * (1 - Math.pow(1 - progress, 3));
        element.textContent = `${value.toFixed(decimals)}${suffix}`;
        if (progress < 1) requestAnimationFrame(count);
      }
      requestAnimationFrame(count);
    }

    if (reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        entry.target.querySelectorAll("[data-kpi-target]").forEach(animateKpi);
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    reveals.forEach((item) => observer.observe(item));
  }

  function initOperatorExperience() {
    const home = document.querySelector(".operator-home");
    if (!home || home.dataset.motionReady === "true") return;
    home.dataset.motionReady = "true";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = [...home.querySelectorAll("[data-operator-reveal]")];
    if (reducedMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    reveals.forEach((item) => observer.observe(item));
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
    if (open) menu.querySelector("a, button")?.focus();
  }

  document.addEventListener("click", (event) => {
    const personality = event.target.closest("[data-personality]");
    if (personality && !personality.disabled) {
      selectPersonality(personality.dataset.personality);
      return;
    }

    if (event.target.closest("[data-enter-visionary]")) {
      startSelectedExperience();
      return;
    }

    if (event.target.closest("[data-change-experience]")) {
      showView("entry");
      personalityButtons.find((button) => button.dataset.personality === selectedPersonality)?.focus();
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
