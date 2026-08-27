(() => {
  const PERSONA_KEY = "ezrewards-persona";
  const SELECTOR_SESSION_KEY = "ezrewards-persona-selector-seen";
  const PERSONAS = {
    default: { label: "Default EzRewards", queryValue: "default", theme: "base-premium", primaryCta: "Join Waitlist", primaryHref: "/contact", description: "Connect employee recognition, meaningful rewards and culture visibility in one EzRewards platform.", themeColor: "#f7f3ea" },
    visionary: { label: "Visionary", queryValue: "visionary", theme: "cinematic-premium", primaryCta: "Build Your Culture", primaryHref: "/contact", description: "Build a workplace people remember with visible recognition, meaningful rewards and culture insight.", themeColor: "#090a16" },
    strategist: { label: "Strategist", queryValue: "strategist", theme: "enterprise-intelligence", primaryCta: "Book a Demo", primaryHref: "/contact", description: "Turn recognition into measurable culture signals that give leadership clarity and confidence.", themeColor: "#f8fafc" },
    operator: { label: "Operator", queryValue: "operator", theme: "dark-product-workflow", primaryCta: "Get Started", primaryHref: "/contact", description: "Run recognition, rewards, onboarding and reporting without operational friction.", themeColor: "#080a0f" },
    "creative-culture-builder": { label: "Creative Culture Builder", queryValue: "creative-culture-builder", theme: "neo-pop-culture", primaryCta: "Make Work Feel Celebrated", primaryHref: "/contact", description: "Make recognition social, expressive and visible with EzRewards appreciation and rewards.", themeColor: "#f2ecdd" }
  };
  const sectionAliases = { "appreciation-loop": "loop" };
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let selectorTrigger = null;
  let currentPersona = "default";

  function emitMarketingEvent(eventName, detail = {}) {
    const payload = { event: eventName, ...detail };
    if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
    dispatchEvent(new CustomEvent(`ezrewards:${eventName}`, { detail }));
  }

  function explicitPersona() {
    const value = new URLSearchParams(location.search).get("persona");
    return value && PERSONAS[value] ? value : null;
  }

  function requestedPersona() {
    const explicit = explicitPersona();
    if (explicit) return explicit;
    try {
      const saved = localStorage.getItem(PERSONA_KEY);
      if (saved && PERSONAS[saved]) return saved;
    } catch {}
    return "default";
  }

  function activeLogicalSection() {
    const activePage = document.querySelector(`[data-persona-page="${currentPersona}"]`);
    if (!activePage) return null;
    return [...activePage.querySelectorAll("[data-persona-section]")].find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 180 && rect.bottom > 180;
    })?.dataset.personaSection || null;
  }

  function setPersona(name, { updateUrl = true, preserveSection = false, emit = false } = {}) {
    const resolvedName = PERSONAS[name] ? name : "default";
    const previous = currentPersona;
    const logicalSection = preserveSection ? activeLogicalSection() : null;
    currentPersona = resolvedName;
    const persona = PERSONAS[resolvedName];
    document.documentElement.dataset.persona = resolvedName;
    document.documentElement.dataset.theme = persona.theme;
    document.querySelectorAll("[data-persona-page]").forEach((page) => {
      const active = page.dataset.personaPage === resolvedName;
      page.hidden = !active;
      page.inert = !active;
      page.id = active ? "main-content" : "";
    });
    document.body.classList.remove("default-active", "dark-visionary", "strategist-active", "operator-active", "creative-active");
    document.body.classList.add({ default: "default-active", visionary: "dark-visionary", strategist: "strategist-active", operator: "operator-active", "creative-culture-builder": "creative-active" }[resolvedName]);
    document.querySelectorAll("[data-persona-option]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.personaOption === resolvedName)));
    const description = document.querySelector('meta[name="description"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const theme = document.querySelector('meta[name="theme-color"]');
    if (description) description.content = persona.description;
    if (ogDescription) ogDescription.content = persona.description;
    if (theme) theme.content = persona.themeColor;
    try { localStorage.setItem(PERSONA_KEY, resolvedName); } catch {}
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set("persona", resolvedName);
      history.replaceState({ persona: resolvedName }, "", url);
    }
    initReveals(document.querySelector(`[data-persona-page="${resolvedName}"]`));
    if (logicalSection) {
      document.querySelector(`[data-persona-page="${resolvedName}"] [data-persona-section="${logicalSection}"]`)?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
    }
    if (emit) emitMarketingEvent(previous === resolvedName ? "persona_selected" : "persona_changed", { persona: resolvedName, previousPersona: previous });
    return resolvedName;
  }

  function openPersonaSelector(trigger = document.activeElement) {
    const dialog = document.querySelector("[data-persona-selector]");
    if (!dialog || dialog.open) return;
    selectorTrigger = trigger instanceof HTMLElement ? trigger : null;
    dialog.showModal();
    document.body.classList.add("dialog-open");
    dialog.querySelector(`[data-persona-option="${currentPersona}"]`)?.focus();
    emitMarketingEvent("persona_selector_opened", { persona: currentPersona });
  }

  function closePersonaSelector({ restoreFocus = true } = {}) {
    const dialog = document.querySelector("[data-persona-selector]");
    if (!dialog?.open) return;
    dialog.close();
    document.body.classList.remove("dialog-open");
    if (restoreFocus) selectorTrigger?.focus();
  }

  function normalizeExistingSections() {
    const definitions = [
      ["visionary", "[data-home-section]", ".visionary-loop-list", [[".visionary-problem", ".visionary-problem-card"], [".visionary-capabilities", ".visionary-capability-card"], [".visionary-outcomes", ".visionary-outcome-grid article"]]],
      ["strategist", "[data-strategist-section]", ".strategist-steps", [['[data-strategist-section="problem"]', ".strategist-card-grid article"], ['[data-strategist-section="capabilities"]', ".strategist-card-grid article"], ['[data-strategist-section="outcomes"]', ".strategist-card-grid article"]]],
      ["operator", "[data-operator-section]", ".operator-steps", [['[data-operator-section="problem"]', ".operator-grid article"], ['[data-operator-section="capabilities"]', ".operator-capabilities article"], ['[data-operator-section="outcomes"]', ".operator-grid article"]]]
    ];
    definitions.forEach(([persona, sectionSelector, stepSelector, stacks]) => {
      const page = document.querySelector(`[data-persona-page="${persona}"]`);
      if (!page) return;
      page.querySelectorAll(sectionSelector).forEach((section) => {
        const raw = section.dataset.homeSection || section.dataset.strategistSection || section.dataset.operatorSection;
        section.dataset.personaSection = sectionAliases[raw] || raw;
      });
      const stepper = page.querySelector(stepSelector);
      if (stepper) stepper.dataset.stepper = "";
      stacks.forEach(([sectionSelectorValue, itemSelector]) => {
        const section = page.querySelector(sectionSelectorValue);
        if (!section) return;
        section.dataset.layout = "sticky-stack";
        section.querySelectorAll(itemSelector).forEach((item) => item.dataset.stackItem = "");
      });
    });
  }

  function updateStickyStack(stack, item, { focus = false, emit = false } = {}) {
    stack.querySelectorAll("[data-stack-item]").forEach((candidate) => candidate.dataset.active = String(candidate === item));
    const summary = stack.querySelector("[data-sticky-summary]");
    if (summary) {
      let active = summary.querySelector("[data-active-summary]");
      if (!active) {
        active = document.createElement("div");
        active.dataset.activeSummary = "";
        active.innerHTML = "<strong></strong><p></p>";
        summary.append(active);
      }
      active.querySelector("strong").textContent = item.querySelector("h3")?.textContent || item.querySelector("span")?.textContent || "";
      active.querySelector("p").textContent = item.querySelector("p")?.textContent || "";
    }
    if (focus) item.focus({ preventScroll: true });
    if (emit) emitMarketingEvent("section_item_selected", { persona: currentPersona, item: item.dataset.itemId || item.querySelector("h3")?.textContent || "" });
  }

  function initStickyStacks(root = document) {
    root.querySelectorAll('[data-layout="sticky-stack"]').forEach((stack) => {
      if (stack.dataset.stickyReady === "true") return;
      stack.dataset.stickyReady = "true";
      let summary = stack.querySelector("[data-sticky-summary]");
      if (!summary) {
        summary = document.createElement("aside");
        summary.className = "shared-dynamic-summary";
        summary.dataset.stickySummary = "";
        (stack.querySelector(".visionary-section-inner, .strategist-wrap, .operator-wrap") || stack).prepend(summary);
      }
      const items = [...stack.querySelectorAll("[data-stack-item]")];
      items.forEach((item) => {
        item.tabIndex = 0;
        item.setAttribute("role", "button");
        item.addEventListener("click", () => updateStickyStack(stack, item, { focus: true, emit: true }));
        item.addEventListener("keydown", (event) => {
          if (!["Enter", " "].includes(event.key)) return;
          event.preventDefault();
          updateStickyStack(stack, item, { focus: true, emit: true });
        });
      });
      if (items[0]) updateStickyStack(stack, items[0]);
      if (!reducedMotion && "IntersectionObserver" in window && innerWidth >= 1024) {
        const observer = new IntersectionObserver((entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top - innerHeight / 2) - Math.abs(b.boundingClientRect.top - innerHeight / 2));
          if (visible[0]) updateStickyStack(stack, visible[0].target);
        }, { rootMargin: "-35% 0px -35% 0px", threshold: 0 });
        items.forEach((item) => observer.observe(item));
      }
    });
  }

  function selectStep(stepper, index, { focus = false, emit = false } = {}) {
    const tabs = [...stepper.querySelectorAll('[role="tab"]')];
    const panels = [...stepper.querySelectorAll('[role="tabpanel"]')];
    const safeIndex = Math.max(0, Math.min(index, tabs.length - 1));
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === safeIndex;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel, panelIndex) => {
      const hidden = panelIndex !== safeIndex;
      panel.hidden = hidden;
      if (panel.parentElement?.tagName === "LI") panel.parentElement.hidden = hidden;
    });
    if (focus) tabs[safeIndex]?.focus();
    if (emit) emitMarketingEvent("how_it_works_step_selected", { persona: currentPersona, step: safeIndex + 1 });
  }

  function initSteppers(root = document) {
    root.querySelectorAll("ol[data-stepper]").forEach((list, stepperIndex) => {
      if (list.dataset.stepperReady === "true") return;
      list.dataset.stepperReady = "true";
      const wrapper = document.createElement("div");
      wrapper.className = "interactive-stepper";
      wrapper.dataset.stepper = "";
      wrapper.dataset.orientation = "horizontal";
      list.before(wrapper);
      wrapper.append(list);
      const tablist = document.createElement("div");
      tablist.className = "stepper-tabs";
      tablist.setAttribute("role", "tablist");
      tablist.setAttribute("aria-label", "How EzRewards works");
      wrapper.prepend(tablist);
      const steps = [...list.children];
      steps.forEach((step, index) => {
        const idBase = `${list.closest("[data-persona-page]")?.dataset.personaPage.replace(/[^a-z0-9]+/g, "-") || "persona"}-step-${stepperIndex}-${index}`;
        const tab = document.createElement("button");
        tab.type = "button";
        tab.id = `${idBase}-tab`;
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", `${idBase}-panel`);
        tab.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span>${step.querySelector("h3")?.textContent || `Step ${index + 1}`}`;
        tab.addEventListener("click", () => selectStep(wrapper, index, { focus: true, emit: true }));
        tab.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          let next = index;
          if (event.key === "Home") next = 0;
          else if (event.key === "End") next = steps.length - 1;
          else next = (index + (event.key === "ArrowRight" ? 1 : -1) + steps.length) % steps.length;
          selectStep(wrapper, next, { focus: true, emit: true });
        });
        tablist.append(tab);
        const panel = document.createElement("div");
        panel.id = `${idBase}-panel`;
        panel.className = "stepper-panel";
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        while (step.firstChild) panel.append(step.firstChild);
        step.append(panel);
      });
      selectStep(wrapper, 0);
    });
  }

  function initSelectablePanels(root = document) {
    const labels = ["Recognition", "Participation", "Rewards", "Onboarding & insights"];
    root.querySelectorAll('[data-persona-section="capabilities"]').forEach((section, componentIndex) => {
      if (section.dataset.panelsReady === "true") return;
      const container = section.querySelector(".visionary-capability-grid, .strategist-capabilities, .operator-capabilities, .shared-stack, .creative-stack");
      if (!container) return;
      const cards = [...container.children].filter((card) => card.matches("article"));
      if (cards.length < 4) return;
      section.dataset.panelsReady = "true";
      section.dataset.selectablePanels = "";
      section.removeAttribute("data-layout");
      section.querySelector(".shared-dynamic-summary")?.remove();
      const persona = section.closest("[data-persona-page]")?.dataset.personaPage || "persona";
      const shell = document.createElement("div");
      shell.className = "capability-selector";
      const tabs = document.createElement("div");
      tabs.className = "capability-selector__tabs";
      tabs.setAttribute("role", "tablist");
      tabs.setAttribute("aria-label", "EzRewards capability groups");
      const panels = document.createElement("div");
      panels.className = "capability-selector__panels";
      container.before(shell);
      shell.append(tabs, panels);
      container.remove();
      const groupSize = Math.ceil(cards.length / 4);
      const groups = Array.from({ length: 4 }, (_, index) => cards.slice(index * groupSize, (index + 1) * groupSize)).filter((group) => group.length);
      const select = (index, focus = false) => {
        [...tabs.children].forEach((tab, tabIndex) => {
          const active = tabIndex === index;
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = active ? 0 : -1;
          panels.children[tabIndex].hidden = !active;
        });
        if (focus) tabs.children[index]?.focus();
      };
      groups.forEach((group, index) => {
        const id = `${persona}-capability-${componentIndex}-${index}`;
        const tab = document.createElement("button");
        tab.type = "button";
        tab.id = `${id}-tab`;
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", `${id}-panel`);
        tab.textContent = labels[index];
        const panel = document.createElement("div");
        panel.id = `${id}-panel`;
        panel.className = "capability-selector__panel";
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        group.forEach((card) => {
          delete card.dataset.stackItem;
          card.removeAttribute("role");
          card.removeAttribute("tabindex");
          card.removeAttribute("data-active");
          panel.append(card);
        });
        tab.addEventListener("click", () => { select(index, true); emitMarketingEvent("section_item_selected", { persona: currentPersona, section: "capabilities", item: labels[index] }); });
        tab.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          let next = index;
          if (event.key === "Home") next = 0;
          else if (event.key === "End") next = groups.length - 1;
          else next = (index + (event.key === "ArrowRight" ? 1 : -1) + groups.length) % groups.length;
          select(next, true);
        });
        tabs.append(tab);
        panels.append(panel);
      });
      select(0);
    });
  }

  function initReveals(root = document) {
    if (!root) return;
    const reveals = [...root.querySelectorAll("[data-dark-reveal], [data-strategist-reveal], [data-operator-reveal], [data-reveal]")];
    if (reducedMotion || !("IntersectionObserver" in window)) { reveals.forEach((item) => item.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver((entries, revealObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((item) => observer.observe(item));
  }

  function initPersonaExperience() {
    if (!document.querySelector("[data-persona-page]")) return null;
    normalizeExistingSections();
    document.querySelectorAll("[data-persona-page]").forEach((page) => { initSelectablePanels(page); initStickyStacks(page); initSteppers(page); });
    const rawQuery = new URLSearchParams(location.search).get("persona");
    const resolved = rawQuery && !PERSONAS[rawQuery] ? "default" : requestedPersona();
    setPersona(resolved, { updateUrl: Boolean(rawQuery && !PERSONAS[rawQuery]) });
    const sentinel = document.querySelector("[data-persona-intro-sentinel]");
    let seen = false;
    try { seen = sessionStorage.getItem(SELECTOR_SESSION_KEY) === "true"; } catch {}
    if (!explicitPersona() && !seen && sentinel && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries, currentObserver) => {
        if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.55)) return;
        try { sessionStorage.setItem(SELECTOR_SESSION_KEY, "true"); } catch {}
        openPersonaSelector(document.querySelector("[data-persona-intro] [data-change-experience]"));
        currentObserver.disconnect();
      }, { threshold: [0.55] });
      observer.observe(sentinel);
    }
    return resolved;
  }

  function setMenu(toggle, open) {
    const menu = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    toggle.textContent = open ? "Close" : "Menu";
    menu.classList.toggle("is-open", open);
  }

  function validateDemoForm(form) {
    const status = form.querySelector(".demo-form-status");
    const controls = [...form.querySelectorAll("input, select, textarea")];
    const firstInvalid = controls.find((control) => !control.validity.valid);
    controls.forEach((control) => {
      control.toggleAttribute("aria-invalid", !control.validity.valid);
      if (!control.validity.valid && status?.id) control.setAttribute("aria-describedby", status.id);
      else if (control.getAttribute("aria-describedby") === status?.id) control.removeAttribute("aria-describedby");
    });
    if (!firstInvalid) { if (status) status.textContent = ""; return true; }
    if (status) status.textContent = "Please complete the required fields.";
    firstInvalid.focus();
    form.reportValidity();
    return false;
  }

  document.addEventListener("click", (event) => {
    const change = event.target.closest("[data-change-experience]");
    if (change) { openPersonaSelector(change); return; }
    const option = event.target.closest("[data-persona-option]");
    if (option) {
      const persona = option.dataset.personaOption;
      setPersona(persona, { updateUrl: true, preserveSection: true, emit: true });
      emitMarketingEvent(persona === "default" ? "persona_default_selected" : "persona_selected", { persona });
      closePersonaSelector({ restoreFocus: false });
      const heading = document.querySelector(`[data-persona-page="${persona}"] h1`);
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      return;
    }
    if (event.target.closest("[data-persona-close]")) { closePersonaSelector(); return; }
    const dialog = event.target.closest("[data-persona-selector]");
    if (dialog && event.target === dialog) { closePersonaSelector(); return; }
    const toggle = event.target.closest("[data-menu-toggle]");
    if (toggle) { setMenu(toggle, toggle.getAttribute("aria-expanded") !== "true"); return; }
    if (event.target.closest(".primary-navigation a")) {
      const openToggle = document.querySelector('[data-menu-toggle][aria-expanded="true"]');
      if (openToggle) setMenu(openToggle, false);
    }
    const cta = event.target.closest('a[href="/contact"]');
    if (cta) emitMarketingEvent("cta_clicked", { persona: currentPersona, label: cta.textContent.trim() });
    const submitButton = event.target.closest("form[data-demo-form] button");
    if (submitButton && !validateDemoForm(submitButton.closest("form"))) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);

  document.addEventListener("submit", (event) => {
    const form = event.target.closest?.("form[data-demo-form]");
    if (!form) return;
    emitMarketingEvent("waitlist_started", { persona: currentPersona });
    if (!validateDemoForm(form)) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);

  document.addEventListener("keydown", (event) => {
    const demoForm = event.target.closest?.("form[data-demo-form]");
    if (demoForm && event.key === "Enter" && event.target.tagName !== "TEXTAREA") { event.preventDefault(); demoForm.querySelector("button")?.click(); return; }
    if (event.key !== "Escape") return;
    const dialog = document.querySelector("[data-persona-selector]");
    if (dialog?.open) { closePersonaSelector(); return; }
    const toggle = document.querySelector('[data-menu-toggle][aria-expanded="true"]');
    if (toggle) { setMenu(toggle, false); toggle.focus(); }
  });

  addEventListener("popstate", () => setPersona(requestedPersona(), { updateUrl: false }));
  addEventListener("resize", () => {
    if (innerWidth > 767) {
      const toggle = document.querySelector('[data-menu-toggle][aria-expanded="true"]');
      if (toggle) setMenu(toggle, false);
    }
  });
  window.EzRewardsPersona = { PERSONAS, initPersonaExperience, setPersona, openPersonaSelector, closePersonaSelector, initStickyStacks, initSteppers, initSelectablePanels, emitMarketingEvent };
  initPersonaExperience();
})();
