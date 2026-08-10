(() => {
  const PERSONA_KEY = "ezrewards-persona";
  const hasPersonaSwitcher = Boolean(document.querySelector('[role="tab"][data-personality]'));
  const personas = {
    visionary: {
      eyebrow: "For companies people want to belong to",
      headline: "Build the kind of workplace people remember.",
      support: "Make meaningful work visible, turn appreciation into a shared habit, and create a culture where people know their contribution matters.",
      description: "Build the kind of workplace people remember with meaningful employee appreciation, rewards, and culture insights."
    },
    strategist: {
      eyebrow: "For leaders who turn culture into clarity",
      headline: "Turn culture into a signal leaders can act on.",
      support: "Connect recognition, participation, and reward patterns so leaders can understand what is working and make confident culture decisions.",
      description: "Make workplace culture measurable with connected recognition, participation, and reward insights from EzRewards."
    },
    operator: {
      eyebrow: "For teams who make great programs work",
      headline: "Run recognition without operational friction.",
      support: "Bring recognition, rewards, budgets, and program controls together so appreciation stays consistent as your company grows.",
      description: "Run reliable recognition programs with connected rewards, budgets, controls, and reporting from EzRewards."
    }
  };

  function requestedPersona() {
    const value = new URLSearchParams(location.search).get("persona");
    if (value && personas[value]) return value;
    try {
      const saved = localStorage.getItem(PERSONA_KEY);
      if (saved && personas[saved]) return saved;
    } catch {}
    return "visionary";
  }

  function setPersona(name, { updateUrl = true } = {}) {
    const persona = personas[name] || personas.visionary;
    const resolvedName = personas[name] ? name : "visionary";
    document.documentElement.dataset.persona = resolvedName;
    const visiblePage = ["visionary", "strategist", "operator"].includes(resolvedName) ? resolvedName : "visionary";
    document.querySelectorAll("[data-persona-page]").forEach((page) => {
      const active = page.dataset.personaPage === visiblePage;
      page.hidden = !active;
      page.inert = !active;
      page.id = active ? "main-content" : "";
    });
    document.body.classList.toggle("strategist-active", visiblePage === "strategist");
    document.body.classList.toggle("operator-active", visiblePage === "operator");
    document.body.classList.toggle("dark-visionary", visiblePage === "visionary");
    document.querySelectorAll("[data-personality]").forEach((tab) => {
      tab.setAttribute("aria-selected", String(tab.dataset.personality === resolvedName));
      tab.tabIndex = tab.dataset.personality === resolvedName ? 0 : -1;
    });
    document.querySelectorAll("[data-persona-copy]").forEach((node) => {
      node.textContent = persona[node.dataset.personaCopy];
    });
    const description = document.querySelector('meta[name="description"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (description) description.content = persona.description;
    if (ogDescription) ogDescription.content = persona.description;
    try { localStorage.setItem(PERSONA_KEY, resolvedName); } catch {}
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set("persona", resolvedName);
      history.replaceState({ persona: resolvedName }, "", url);
    }
    if (visiblePage === "strategist") initStrategistReveals();
    if (visiblePage === "operator") initOperatorReveals();
  }

  function initOperatorReveals() {
    const home = document.querySelector('[data-persona-page="operator"]');
    if (!home || home.dataset.revealsReady === "true") return;
    home.dataset.revealsReady = "true";
    const reveals = [...home.querySelectorAll("[data-operator-reveal]")];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((item) => observer.observe(item));
  }

  function initStrategistReveals() {
    const home = document.querySelector('[data-persona-page="strategist"]');
    if (!home || home.dataset.revealsReady === "true") return;
    home.dataset.revealsReady = "true";
    const reveals = [...home.querySelectorAll("[data-strategist-reveal]")];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((item) => observer.observe(item));
  }

  function initReveals() {
    const reveals = [...document.querySelectorAll("[data-dark-reveal]")];
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    reveals.forEach((item) => observer.observe(item));
  }

  function initOrbit() {
    const orbit = document.querySelector("[data-dark-parallax]");
    if (!orbit || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    const personaTab = event.target.closest('[role="tab"][data-personality]');
    if (personaTab) {
      setPersona(personaTab.dataset.personality);
      personaTab.focus();
      return;
    }
    const toggle = event.target.closest("[data-menu-toggle]");
    if (toggle) {
      setMenu(toggle, toggle.getAttribute("aria-expanded") !== "true");
      return;
    }
    if (event.target.closest(".primary-navigation a")) {
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
      } else if (status) status.textContent = "";
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    const currentTab = event.target.closest?.('[role="tab"][data-personality]');
    if (currentTab && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const tabs = [...document.querySelectorAll('[role="tab"][data-personality]')];
      let index = tabs.indexOf(currentTab);
      if (event.key === "Home") index = 0;
      else if (event.key === "End") index = tabs.length - 1;
      else index = (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[index].click();
      return;
    }
    if (event.key !== "Escape") return;
    const toggle = document.querySelector('[data-menu-toggle][aria-expanded="true"]');
    if (toggle) { setMenu(toggle, false); toggle.focus(); }
  });

  if (hasPersonaSwitcher) addEventListener("popstate", () => setPersona(requestedPersona(), { updateUrl: false }));
  addEventListener("resize", () => {
    if (innerWidth > 767) {
      const toggle = document.querySelector('[data-menu-toggle][aria-expanded="true"]');
      if (toggle) setMenu(toggle, false);
    }
  });

  if (hasPersonaSwitcher) setPersona(requestedPersona(), { updateUrl: false });
  initReveals();
  initOrbit();
})();
