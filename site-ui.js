(() => {
  function setMenu(toggle, open) {
    const menu = document.getElementById(toggle.getAttribute("aria-controls"));
    if (!menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    toggle.textContent = open ? "Close" : "Menu";
    menu.classList.toggle("is-open", open);
  }

  document.addEventListener("click", (event) => {
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
