const root = document.querySelector("[data-strategist-cinematic]");

if (root) {
  const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const fullQuery = matchMedia("(min-width: 1200px) and (min-height: 760px) and (pointer: fine)");
  const adaptiveQuery = matchMedia("(min-width: 768px)");
  const sections = [...root.querySelectorAll("[data-strategist-section]")];
  const interactiveScenes = new Map();
  let mode = "static";
  let frame = 0;
  let observer;
  let activeSection = "hero";
  let particleField;
  let problemParticles;
  const clamp = (value) => Math.max(0, Math.min(1, value));

  function createProblemParticles() {
    const section = root.querySelector('[data-strategist-scene="problem"]');
    const wrap = section?.querySelector('.strategist-wrap');
    if (!wrap) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'strategist-problem-particles';
    canvas.setAttribute('aria-hidden', 'true');
    wrap.prepend(canvas);
    const context = canvas.getContext('2d');
    if (!context) return;
    const particles = Array.from({length:48}, (_, index) => ({
      x: ((index * .618034) % 1), y: ((index * .381966 + .12) % 1),
      radius: index % 7 === 0 ? 1.5 : .75, phase: index * 1.9,
    }));
    let width = 1, height = 1, animation = 0, visible = false;
    function resize() {
      const rect = wrap.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(time) {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle, index) => {
        const x = particle.x * width + Math.sin(time * .00007 + particle.phase) * 14;
        const y = particle.y * height + Math.cos(time * .00005 + particle.phase) * 18;
        context.fillStyle = `rgba(${index % 4 ? '121,155,220' : '151,230,255'},${.3 + Math.sin(time * .0003 + particle.phase) * .1})`;
        context.beginPath(); context.arc(x, y, particle.radius, 0, Math.PI * 2); context.fill();
      });
      animation = requestAnimationFrame(draw);
    }
    function sync() {
      cancelAnimationFrame(animation);
      if (visible && !root.hidden && !root.inert && !reducedQuery.matches && !document.hidden) {
        animation = requestAnimationFrame(draw);
      } else context.clearRect(0, 0, width, height);
    }
    const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    visibility.observe(wrap);
    new ResizeObserver(resize).observe(wrap);
    document.addEventListener('visibilitychange', sync);
    resize();
    return {sync, resize};
  }

  root.dataset.strategistEngine = "elva-inspired";
  sections.forEach((section) => {
    section.dataset.strategistScene = section.dataset.strategistSection;
    section.dataset.sceneProgress = "0";
  });

  function createParticleField() {
    const canvas = document.createElement("canvas");
    canvas.className = "strategist-particle-field";
    canvas.setAttribute("aria-hidden", "true");
    root.prepend(canvas);
    const context = canvas.getContext("2d", { alpha: true });
    const particles = Array.from({ length: 76 }, (_, index) => ({
      x: Math.random(), y: Math.random(), tx: Math.random(), ty: Math.random(), vx: 0, vy: 0,
      size: index % 11 === 0 ? 2.2 : 1 + Math.random() * 1.1, phase: Math.random() * Math.PI * 2,
    }));
    let width = 1;
    let height = 1;
    let running = false;
    let drawFrame = 0;
    let pointerX = .72;
    let pointerY = .35;

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 1.6);
      width = innerWidth; height = innerHeight;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function setTargets(section, progress) {
      particles.forEach((particle, index) => {
        const angle = (index / particles.length) * Math.PI * 2 + progress * .7;
        if (section === "problem") {
          const cluster = index % 4;
          particle.tx = .57 + cluster * .1 + Math.cos(angle * 3) * .045;
          particle.ty = .27 + (index % 9) * .055 + Math.sin(angle * 2) * .035;
        } else if (section === "category" || section === "loop") {
          particle.tx = .5 + Math.cos(angle) * (.12 + (index % 5) * .018);
          particle.ty = .5 + Math.sin(angle) * (.18 + (index % 4) * .018);
        } else if (section === "outcomes") {
          const ring = 1 + (index % 4);
          particle.tx = .58 + Math.cos(angle) * ring * .065;
          particle.ty = .5 + Math.sin(angle) * ring * .085;
        } else if (section === "final-cta" || section === "early-access") {
          particle.tx = .08 + (index / particles.length) * .84;
          particle.ty = .58 + Math.sin(index * 1.7) * .025;
        } else {
          particle.tx = .5 + Math.cos(angle) * .34 + (pointerX - .5) * .025;
          particle.ty = .48 + Math.sin(angle * 1.35) * .3 + (pointerY - .5) * .02;
        }
      });
    }

    function draw(time = 0) {
      if (!running) return;
      context.clearRect(0, 0, width, height);
      const progress = Number(root.querySelector(`[data-strategist-scene="${activeSection}"]`)?.dataset.sceneProgress || 0);
      setTargets(activeSection, progress);
      const points = particles.map((particle) => {
        particle.vx = (particle.vx + (particle.tx - particle.x) * .012) * .88;
        particle.vy = (particle.vy + (particle.ty - particle.y) * .012) * .88;
        particle.x += particle.vx; particle.y += particle.vy;
        return [particle.x * width, particle.y * height];
      });
      context.globalCompositeOperation = "lighter";
      points.forEach(([x, y], index) => {
        const particle = particles[index];
        const pulse = .48 + Math.sin(time * .0012 + particle.phase) * .2;
        context.fillStyle = `rgba(${index % 5 ? "91,140,255" : "113,232,255"},${pulse})`;
        context.beginPath(); context.arc(x, y, particle.size, 0, Math.PI * 2); context.fill();
        if (index % 3 === 0) {
          const next = points[(index + 7) % points.length];
          const distance = Math.hypot(next[0] - x, next[1] - y);
          if (distance < width * .19) {
            context.strokeStyle = `rgba(91,140,255,${Math.max(0, .13 - distance / width)})`;
            context.lineWidth = .7; context.beginPath(); context.moveTo(x, y); context.lineTo(next[0], next[1]); context.stroke();
          }
        }
      });
      context.globalCompositeOperation = "source-over";
      drawFrame = requestAnimationFrame(draw);
    }

    function start() { if (running || reducedQuery.matches || root.hidden || root.inert) return; running = true; drawFrame = requestAnimationFrame(draw); }
    function stop() { running = false; cancelAnimationFrame(drawFrame); context.clearRect(0, 0, width, height); }
    resize();
    addEventListener("pointermove", (event) => { pointerX = event.clientX / innerWidth; pointerY = event.clientY / innerHeight; }, { passive: true });
    return { resize, start, stop };
  }

  function setupLoader() {
    const hero = root.querySelector('[data-strategist-scene="hero"]');
    if (!hero || sessionStorage.getItem("ezrewards-strategist-intro") || reducedQuery.matches) return;
    const loader = document.createElement("div");
    loader.className = "strategist-intro-loader";
    loader.setAttribute("aria-hidden", "true");
    loader.innerHTML = '<span>Fragmented</span><i></i><strong>Connected</strong>';
    hero.prepend(loader);
    requestAnimationFrame(() => loader.dataset.state = "playing");
    setTimeout(() => { loader.dataset.state = "complete"; sessionStorage.setItem("ezrewards-strategist-intro", "true"); }, 1050);
    setTimeout(() => loader.remove(), 1450);
  }

  function setupScene(sectionName, cardSelector) {
    const section = root.querySelector(`[data-strategist-scene="${sectionName}"]`);
    if (!section) return;
    const cards = [...section.querySelectorAll(cardSelector)];
    if (cards.length < 2) return;
    cards.forEach((card, index) => { card.dataset.sceneStage = String(index); card.dataset.stageState = index === 0 ? "active" : "future"; });
    // Tabpanel items cannot stay direct children of a semantic list.
    const list = cards[0].parentElement;
    if (list?.matches("ol, ul")) list.setAttribute("role", "presentation");
    const navigator = document.createElement("div");
    navigator.className = "strategist-scene-nav";
    navigator.setAttribute("role", "tablist");
    navigator.setAttribute("aria-label", `${sectionName} stages`);
    cards.forEach((card, index) => {
      const label = card.querySelector("small, h3")?.textContent.trim() || `Stage ${index + 1}`;
      card.id ||= `strategist-${sectionName}-stage-${index}`;
      card.setAttribute("role", "tabpanel");
      const button = document.createElement("button");
      button.id = `${card.id}-tab`;
      card.setAttribute('aria-labelledby', button.id);
      button.type = "button"; button.setAttribute("role", "tab"); button.setAttribute("aria-controls", card.id);
      button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span>${label}`;
      navigator.append(button);
    });
    const stage = section.querySelector(".strategist-card-grid, .strategist-steps, .stepper");
    stage?.before(navigator);
    const tabs = [...navigator.querySelectorAll('[role="tab"]')];
    const select = (index, focus = false, scroll = false) => {
      const safe = Math.max(0, Math.min(cards.length - 1, index));
      cards.forEach((card, cardIndex) => card.dataset.stageState = cardIndex === safe ? "active" : cardIndex < safe ? "past" : "future");
      tabs.forEach((tab, tabIndex) => { tab.setAttribute("aria-selected", String(tabIndex === safe)); tab.tabIndex = tabIndex === safe ? 0 : -1; });
      section.dataset.activeStage = String(safe);
      if (focus) tabs[safe]?.focus();
      if (scroll && mode === "full") {
        const stickyTop = parseFloat(getComputedStyle(section.querySelector('.strategist-wrap')).top) || 76;
        const start = section.getBoundingClientRect().top + scrollY - stickyTop;
        const travel = Math.max(1, section.offsetHeight - innerHeight + stickyTop);
        const top = sectionName === 'problem' ? start + travel * (safe / (cards.length - 1)) : section.offsetTop + (section.offsetHeight - innerHeight) * (safe / Math.max(1, cards.length - 1));
        scrollTo({ top, behavior: reducedQuery.matches ? "auto" : "smooth" });
      }
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(index, true, true));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
        select(next, true, true);
      });
    });
    select(0);
    interactiveScenes.set(sectionName, { section, cards, tabs, select });
  }

  function setupWorkflowScene() {
    const section = root.querySelector('[data-strategist-scene="loop"]');
    const cards = [...section?.querySelectorAll('.strategist-workflow__card') || []];
    if (section && cards.length) interactiveScenes.set("loop", { section, cards });
  }

  function updateWorkflow(controller, rect) {
    const { section, cards } = controller;
    const animated = !reducedQuery.matches;
    section.dataset.workflowMotion = animated ? "stack" : "flow";
    const progress = animated ? clamp(-rect.top / Math.max(1, rect.height - innerHeight)) : 0;
    cards.forEach((card, index) => {
      // Hold the initial stack briefly; each exit follows scroll in both directions.
      const exit = clamp((progress * 4.6 - .3 - index) / .8);
      const eased = exit * exit * (3 - 2 * exit);
      const direction = index % 2 ? 1 : -1;
      const tilt = direction * (3 + index * 1.5);
      card.style.setProperty('--card-x', direction * eased * Math.min(innerWidth * .62, 900) + 'px');
      card.style.setProperty('--card-y', (index * -8 - eased * 35) + 'px');
      card.style.setProperty('--card-angle', (tilt + direction * eased * 18) + 'deg');
      card.style.setProperty('--card-opacity', String(1 - eased));
      card.style.zIndex = String(cards.length - index);
    });
    section.dataset.workflowProgress = progress.toFixed(4);
  }

  function setupCapabilityFeatures() {
    const section = root.querySelector('[data-capability-features]');
    if (!section) return;
    const tabs = [...section.querySelectorAll('[role="tab"]')];
    const panels = [...section.querySelectorAll('[role="tabpanel"]')];
    const pause = section.querySelector('[data-feature-pause]');
    let active = 0, elapsed = 0, previous = 0, animation = 0, visible = false;
    let paused = reducedQuery.matches;
    const select = (index, focus = false) => {
      active = (index + tabs.length) % tabs.length;
      elapsed = 0;
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === active));
        tab.tabIndex = i === active ? 0 : -1;
        tab.style.setProperty('--tab-progress', '0');
        panels[i].hidden = i !== active;
      });
      if (focus) tabs[active].focus();
    };
    function sync() {
      cancelAnimationFrame(animation); previous = 0;
      if (visible && !paused && !document.hidden && !root.hidden && !root.inert) animation = requestAnimationFrame(tick);
    }
    function tick(now) {
      if (previous) elapsed += now - previous;
      previous = now;
      if (elapsed >= 5000) select(active + 1);
      tabs[active].style.setProperty('--tab-progress', String(elapsed / 5000));
      animation = requestAnimationFrame(tick);
    }
    function updatePause() {
      pause.setAttribute('aria-label', paused ? 'Play automatic tabs' : 'Pause automatic tabs');
      pause.innerHTML = paused ? 'Play <span aria-hidden="true">&#9655;</span>' : 'Pause <span aria-hidden="true">&#8545;</span>';
      section.dataset.autoplay = paused ? 'paused' : 'playing';
      sync();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        select(event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1), true);
      });
    });
    pause.addEventListener('click', () => { paused = !paused; updatePause(); });
    // Keep an interactive panel in place while someone reads it with keyboard focus.
    section.addEventListener('focusin', event => { if (event.target.matches('[role="tabpanel"]')) { paused = true; updatePause(); } });
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .25 }).observe(section);
    document.addEventListener('visibilitychange', sync);
    new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['hidden', 'inert'] });
    reducedQuery.addEventListener('change', () => { paused = reducedQuery.matches; updatePause(); });
    select(0); updatePause();
  }

  function setupScenes() {
    root.querySelectorAll('.shared-dynamic-summary').forEach((summary) => summary.remove());
    setupScene("problem", ".strategist-card-grid > article");
    setupScene("category", ".strategist-card-grid > article");
    setupWorkflowScene();
    setupCapabilityFeatures();
    setupScene("outcomes", ".strategist-card-grid > article");
    root.querySelector('[data-strategist-scene="capabilities"] .capability-selector')?.classList.add("strategist-intelligence-console");
    root.querySelectorAll(".strategist-faq details").forEach((details) => {
      details.addEventListener("focusin", () => particleField?.stop());
      details.addEventListener("focusout", () => { if (!reducedQuery.matches) particleField?.start(); });
    });
  }

  function chooseMode() {
    mode = reducedQuery.matches ? "static" : fullQuery.matches ? "full" : adaptiveQuery.matches ? "adaptive" : "mobile";
    root.dataset.sceneMode = mode;
    root.dataset.strategistMode = mode === "full" ? "full" : mode === "static" ? "static" : "flow";
    document.documentElement.dataset.strategistMode = mode;
    const problem = interactiveScenes.get('problem');
    if (problem) {
      problem.section.dataset.problemMotion = mode === 'full' ? 'orbit' : 'flow';
      problem.cards.forEach((card) => {
        if (mode !== 'full') {
          card.removeAttribute('aria-hidden'); card.inert = false;
          card.removeAttribute('role'); card.removeAttribute('aria-labelledby');
          card.removeAttribute('tabindex');
        } else {
          card.setAttribute('role', 'tabpanel');
          card.setAttribute('aria-labelledby', `${card.id}-tab`);
        }
      });
    }
  }

  function updateProblemOrbit(controller, rect) {
    const { section, cards, tabs, select } = controller;
    if (mode !== 'full') return;
    const wrap = section.querySelector('.strategist-wrap');
    const stickyTop = parseFloat(getComputedStyle(wrap).top) || 76;
    const travel = Math.max(1, rect.height - innerHeight + stickyTop);
    const progress = clamp((stickyTop - rect.top) / travel);
    const position = progress * (cards.length - 1);
    const active = Math.round(position);
    select(active);
    section.style.setProperty('--problem-intro', clamp((innerHeight - rect.top) / (innerHeight * .6)).toFixed(3));
    const entry = clamp((innerHeight - rect.top) / (innerHeight * .95));
    section.style.setProperty('--problem-stage-reveal', clamp((entry - .56) / .4).toFixed(3));
    tabs.forEach((tab, index) => tab.style.setProperty('--point-reveal', clamp((entry - .54 - index * .08) / .16).toFixed(3)));
    const stageWidth = section.querySelector('.strategist-card-grid').clientWidth;
    const radiusX = Math.min(240, stageWidth * .38);
    const radiusY = Math.min(250, innerHeight * .27);
    cards.forEach((card, index) => {
      const angle = Math.PI + (position - index) * Math.PI / 2;
      const proximity = clamp(-Math.cos(angle));
      card.style.setProperty('--orbit-x', `${(radiusX * (1 + Math.cos(angle))).toFixed(2)}px`);
      card.style.setProperty('--orbit-y', `${(radiusY * Math.sin(angle)).toFixed(2)}px`);
      card.style.setProperty('--orbit-scale', (.8 + proximity * .2).toFixed(3));
      card.style.setProperty('--orbit-opacity', (.18 + Math.pow(proximity, 5) * .82).toFixed(3));
      card.style.zIndex = String(Math.round(proximity * 10));
      card.setAttribute('aria-hidden', String(index !== active));
      card.inert = index !== active;
      card.tabIndex = index === active ? 0 : -1;
    });
    section.dataset.orbitProgress = progress.toFixed(4);
  }

  function updateScenes() {
    frame = 0;
    if (root.hidden || root.inert) return;
    let closest = { name: "hero", distance: Infinity };
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / Math.max(1, innerHeight + rect.height)));
      section.dataset.sceneProgress = progress.toFixed(3);
      section.style.setProperty("--scene-progress", progress.toFixed(3));
      const distance = Math.abs(rect.top + rect.height / 2 - innerHeight / 2);
      if (distance < closest.distance) closest = { name: section.dataset.strategistScene, distance };
      const controller = interactiveScenes.get(section.dataset.strategistScene);
      if (controller && section.dataset.strategistScene === 'loop') updateWorkflow(controller, rect);
      else if (controller && section.dataset.strategistScene === 'problem') updateProblemOrbit(controller, rect);
      else if (controller && mode === "full") controller.select(Math.min(controller.cards.length - 1, Math.floor(progress * controller.cards.length)));
    });
    activeSection = closest.name;
    root.dataset.activeScene = activeSection;
  }

  function requestUpdate() { if (!frame) frame = requestAnimationFrame(updateScenes); }
  function configure() {
    chooseMode(); particleField?.resize();
    problemParticles?.resize(); problemParticles?.sync();
    if (reducedQuery.matches || root.hidden || root.inert) particleField?.stop(); else particleField?.start();
    requestUpdate();
  }

  function init() {
    root.querySelectorAll('.strategist-vision__video, .strategist-access__video').forEach(video => {
      const scene = video.closest('[data-strategist-section]');
      let visible = false;
      video.muted = true;
      const syncVideo = () => {
        if (visible && !root.hidden && !root.inert && !document.hidden && !reducedQuery.matches) video.play().catch(() => {});
        else video.pause();
      };
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncVideo(); }, { threshold: .05 }).observe(scene);
      document.addEventListener('visibilitychange', syncVideo);
      reducedQuery.addEventListener('change', syncVideo);
      new MutationObserver(syncVideo).observe(root, { attributes: true, attributeFilter: ['hidden', 'inert'] });
      syncVideo();
    });
    particleField = createParticleField();
    problemParticles = createProblemParticles();
    // The hero starts immediately; motion follows the active persona visibility.
    const dashboardStage = root.querySelector('.strategist-dashboard-stage');
    const dashboardObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !root.hidden) {
          entry.target.classList.add('is-revealed');
          dashboardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    if (dashboardStage) dashboardObserver.observe(dashboardStage);
    requestAnimationFrame(() => {
      setupScenes(); chooseMode();
      observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.dataset.sceneVisible = String(entry.isIntersecting)), { rootMargin: "15% 0px", threshold: .08 });
      sections.forEach((section) => observer.observe(section));
      const resizeObserver = new ResizeObserver(requestUpdate);
      sections.forEach((section) => resizeObserver.observe(section));
      document.fonts?.ready.then(configure); configure();
    });
    addEventListener("scroll", requestUpdate, { passive: true });
    addEventListener("resize", configure, { passive: true });
    reducedQuery.addEventListener("change", configure); fullQuery.addEventListener("change", configure); adaptiveQuery.addEventListener("change", configure);
    new MutationObserver(configure).observe(root, { attributes: true, attributeFilter: ["hidden", "inert"] });
  }

  if (document.readyState === "loading") addEventListener("DOMContentLoaded", init, { once: true }); else init();
}
