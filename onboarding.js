(() => {
  const form = document.querySelector('[data-onboarding-form]');
  if (!form) return;

  const steps = [...form.querySelectorAll('[data-step]')];
  const progress = document.querySelector('[data-step-progress]');
  const progressFill = progress.querySelector('span');
  const stepLabel = document.querySelector('[data-step-label]');
  const stepName = document.querySelector('[data-step-name]');
  const contextCopy = document.querySelector('[data-context-copy]');
  const summary = form.querySelector('[data-error-summary]');
  const summaryList = summary.querySelector('ul');
  const totalSteps = steps.length;
  let currentStep = 1;

  const contextByStep = {
    1: 'Sign in to begin a guided setup for your workplace.',
    2: 'You’ll always know where you are and what comes next.',
    3: 'A few organization details help create useful workspace defaults.',
    4: 'Choose the person who will guide your first recognition launch.',
    5: 'Start with a clear goal. You can adjust every preference later.',
    6: 'Review the plan before your workspace is prepared.',
    7: 'Your foundation is ready. The next step is bringing your people in.'
  };

  const messages = {
    email: { valueMissing: 'Enter your work email.', typeMismatch: 'Enter a valid work email.' },
    password: { valueMissing: 'Enter any password to continue.' },
    organizationName: { valueMissing: 'Enter your organization name.' },
    companySize: { valueMissing: 'Select your company size.' },
    website: { typeMismatch: 'Enter a complete website address, such as https://company.com.' },
    country: { valueMissing: 'Select your country.' },
    timezone: { valueMissing: 'Select your timezone.' },
    adminName: { valueMissing: 'Enter the administrator’s full name.' },
    adminRole: { valueMissing: 'Enter the administrator’s job title.' },
    adminEmail: { valueMissing: 'Enter the administrator email.', typeMismatch: 'Enter a valid administrator email.' },
    programGoal: { valueMissing: 'Choose a primary recognition goal.' },
    launchTiming: { valueMissing: 'Choose an expected launch time.' },
    rewardApproach: { valueMissing: 'Choose how rewards should begin.' }
  };

  const getStep = (number) => steps.find((step) => Number(step.dataset.step) === number);
  const getTitle = (step) => step.querySelector('h1');

  function clearErrors(step) {
    summary.hidden = true;
    summaryList.replaceChildren();
    for (const control of step.querySelectorAll('input, select')) {
      control.removeAttribute('aria-invalid');
      const error = document.getElementById(`${control.name}-error`);
      if (error) { error.hidden = true; error.textContent = ''; }
    }
  }

  function validityMessage(control) {
    const configured = messages[control.name] || {};
    if (control.validity.valueMissing) return configured.valueMissing || 'Complete this required field.';
    if (control.validity.typeMismatch) return configured.typeMismatch || 'Enter a valid value.';
    return control.validationMessage || 'Check this value.';
  }

  function validateStep(number) {
    const step = getStep(number);
    clearErrors(step);
    const controls = [...step.querySelectorAll('input, select')];
    const invalid = [];
    const processedGroups = new Set();

    for (const control of controls) {
      if (control.type === 'radio') {
        if (processedGroups.has(control.name)) continue;
        processedGroups.add(control.name);
        const group = controls.filter((item) => item.name === control.name);
        if (!group.some((item) => item.checked)) invalid.push(control);
      } else if (!control.checkValidity()) invalid.push(control);
    }

    if (!invalid.length) return true;

    for (const control of invalid) {
      const message = validityMessage(control);
      const error = document.getElementById(`${control.name}-error`);
      if (error) { error.textContent = message; error.hidden = false; }
      const related = control.type === 'radio' ? controls.filter((item) => item.name === control.name) : [control];
      related.forEach((item) => {
        item.setAttribute('aria-invalid', 'true');
        const descriptions = [item.getAttribute('aria-describedby'), `${control.name}-error`].filter(Boolean);
        item.setAttribute('aria-describedby', [...new Set(descriptions)].join(' '));
      });
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${control.id || control.name}`;
      link.textContent = message;
      link.addEventListener('click', (event) => { event.preventDefault(); control.focus(); });
      item.append(link);
      summaryList.append(item);
    }
    summary.hidden = false;
    summary.focus();
    return false;
  }

  function collectState() {
    const data = new FormData(form);
    return Object.fromEntries(data.entries());
  }

  function pair(label, value) {
    const wrapper = document.createElement('div');
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = value || 'Not provided';
    wrapper.append(term, detail);
    return wrapper;
  }

  function renderReview() {
    const data = collectState();
    document.querySelector('[data-review-organization]').textContent = data.organizationName || 'Your organization';
    document.querySelector('[data-review-admin]').textContent = data.adminName || 'Administrator';
    document.querySelector('[data-review-goal]').textContent = data.programGoal || 'Recognition plan';
    const organization = document.querySelector('[data-review-organization-list]');
    const admin = document.querySelector('[data-review-admin-list]');
    const preferences = document.querySelector('[data-review-preferences-list]');
    organization.replaceChildren(pair('Company size', data.companySize), pair('Website', data.website), pair('Country', data.country), pair('Timezone', data.timezone));
    admin.replaceChildren(pair('Job title', data.adminRole), pair('Email', data.adminEmail), pair('Phone', data.phone));
    preferences.replaceChildren(pair('Launch timing', data.launchTiming), pair('Rewards', data.rewardApproach));
  }

  function showStep(number, { focus = true } = {}) {
    currentStep = Math.max(1, Math.min(totalSteps, number));
    for (const step of steps) {
      const active = Number(step.dataset.step) === currentStep;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    }
    const activeStep = getStep(currentStep);
    const name = activeStep.dataset.stepName;
    stepLabel.textContent = `Step ${currentStep} of ${totalSteps}`;
    stepName.textContent = name;
    progress.setAttribute('aria-valuenow', String(currentStep));
    progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
    contextCopy.textContent = contextByStep[currentStep];
    document.title = currentStep === 1 ? 'Start your EzRewards setup | EzRewards' : `${name} | EzRewards setup`;
    summary.hidden = true;
    if (currentStep === 4 && !form.elements.adminEmail.value) form.elements.adminEmail.value = form.elements.email.value;
    if (currentStep === 6) renderReview();
    if (currentStep === 7) document.querySelector('[data-complete-organization]').textContent = form.elements.organizationName.value || 'your organization';
    if (focus) getTitle(activeStep).focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setPasswordVisibility(visible) {
    const password = form.elements.password;
    const toggle = form.querySelector('[data-password-toggle]');
    password.type = visible ? 'text' : 'password';
    toggle.textContent = visible ? 'Hide' : 'Show';
    toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (currentStep === 1 && validateStep(1)) showStep(2);
  });
  form.addEventListener('input', (event) => {
    const control = event.target;
    if (!control.name) return;
    control.removeAttribute('aria-invalid');
    const error = document.getElementById(`${control.name}-error`);
    if (error) { error.hidden = true; error.textContent = ''; }
  });
  form.addEventListener('click', (event) => {
    const next = event.target.closest('[data-next]');
    const back = event.target.closest('[data-back]');
    const edit = event.target.closest('[data-edit-step]');
    const passwordToggle = event.target.closest('[data-password-toggle]');
    if (passwordToggle) { setPasswordVisibility(form.elements.password.type === 'password'); return; }
    if (back) { showStep(currentStep - 1); return; }
    if (edit) { showStep(Number(edit.dataset.editStep)); return; }
    if (next && next.type !== 'submit' && validateStep(currentStep)) showStep(currentStep + 1);
  });

  showStep(1, { focus: false });
})();
