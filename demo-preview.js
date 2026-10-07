(() => {
  const conversion = window.EzRewardsConversion;
  const persona = conversion.resolvePersona();
  document.documentElement.dataset.persona = persona;
  conversion.updateLinks(persona);
  const mode = 'demo';
  const themes = {
    default: ['Your EzRewards experience', 'Make meaningful work visible.', 'Connect recognition, rewards and culture insight in one experience.', '#f7f3ea'],
    visionary: ['The Visionary perspective', 'Build a culture people want to belong to.', 'Turn everyday contribution into visible recognition and meaningful rewards.', '#050d09'],
    strategist: ['The Strategist perspective', 'Your culture. A clearer picture.', 'Connect everyday appreciation with structured visibility for your People team.', '#030713'],
    operator: ['The Operator perspective', 'Recognition made easier to run.', 'Bring recognition, rewards and administration into one connected workflow.', '#080c13'],
    'creative-culture-builder': ['The Creative Culture Builder perspective', 'Make work feel celebrated.', 'Give every meaningful contribution a moment people can see and share.', '#f2ecdd']
  };
  const [eyebrow, headline, description, color] = themes[persona];
  document.getElementById('personality-label').textContent = eyebrow;
  document.getElementById('story-title').textContent = headline;
  document.getElementById('story-description').textContent = description;
  document.querySelector('meta[name="theme-color"]').content = color;
  const modes = {
    signup: { title: conversion.labels.signup, description: 'Bring your team’s appreciation experience together.', notice: 'Preview only. No account will be created.', submit: conversion.labels.signup, confirmation: 'Account creation preview complete. No account was created and no details were sent or saved.' },
    signin: { title: conversion.labels.signin, description: 'Welcome back to your EzRewards experience.', notice: 'Preview only. No sign-in will occur.', submit: conversion.labels.signin, confirmation: 'Sign-in preview complete. You have not been signed in and no credentials were sent or saved.' },
    demo: { title: conversion.labels.demo, description: 'Explore how EzRewards could work for your team.', notice: 'Preview only. No demo request will be sent.', submit: 'Request a demo', confirmation: 'Demo request preview complete. No request was sent, no appointment was booked, and no details were saved.' }
  };
  const settings = modes[mode];
  document.title = 'EzRewards | ' + settings.title + ' preview';
  document.getElementById('form-title').textContent = settings.title;
  document.getElementById('form-description').textContent = settings.description;
  document.getElementById('preview-notice').textContent = settings.notice;
  document.getElementById('preview-submit').textContent = settings.submit;
  document.querySelector('.preview-switch [data-conversion="' + mode + '"]').setAttribute('aria-current', 'page');
  const fields = mode === 'signin' ? ['email', 'password'] : mode === 'demo' ? ['name', 'email', 'company', 'message'] : ['name', 'email', 'company', 'password'];
  const definitions = {
    name: { label: 'Full name', type: 'text', autocomplete: 'name', placeholder: 'Your full name' },
    email: { label: 'Work email', type: 'email', autocomplete: 'email', placeholder: 'you@company.com' },
    company: { label: 'Company', type: 'text', autocomplete: 'organization', placeholder: 'Your company' },
    password: { label: 'Password', type: 'password', autocomplete: mode === 'signup' ? 'new-password' : 'current-password' },
    message: { label: 'Message (optional)', placeholder: 'What would you like to explore?' }
  };
  const form = document.getElementById('preview-form');
  const fieldContainer = document.getElementById('preview-fields');
  fields.forEach(name => {
    const definition = definitions[name];
    const wrapper = document.createElement('div'); wrapper.className = 'preview-field';
    const label = document.createElement('label'); label.htmlFor = 'preview-' + name; label.textContent = definition.label;
    const control = document.createElement(name === 'message' ? 'textarea' : 'input');
    control.id = label.htmlFor; control.name = name;
    if (definition.type) control.type = definition.type;
    control.required = name !== 'message';
    if (definition.autocomplete) control.autocomplete = definition.autocomplete;
    if (definition.placeholder) control.placeholder = definition.placeholder;
    if (name === 'password' && mode === 'signup') control.minLength = 8;
    const error = document.createElement('p'); error.id = control.id + '-error'; error.className = 'field-error'; error.hidden = true;
    control.setAttribute('aria-describedby', error.id);
    wrapper.append(label);
    if (name === 'password') {
      const shell = document.createElement('div'); shell.className = 'password-control';
      const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'password-toggle'; toggle.textContent = 'Show'; toggle.setAttribute('aria-label', 'Show password'); toggle.setAttribute('aria-pressed', 'false'); toggle.setAttribute('aria-controls', control.id);
      toggle.addEventListener('click', () => { const showing = control.type === 'password'; control.type = showing ? 'text' : 'password'; toggle.textContent = showing ? 'Hide' : 'Show'; toggle.setAttribute('aria-label', showing ? 'Hide password' : 'Show password'); toggle.setAttribute('aria-pressed', String(showing)); });
      shell.append(control, toggle); wrapper.append(shell);
    } else wrapper.append(control);
    wrapper.append(error); fieldContainer.append(wrapper);
    control.addEventListener('input', () => { if (control.hasAttribute('aria-invalid')) validate(control); });
  });
  function validate(control) {
    let message = '';
    if (control.required && !control.value.trim()) message = 'Please enter your ' + definitions[control.name].label.toLowerCase() + '.';
    else if (control.type === 'email' && !control.validity.valid) message = 'Enter a valid work email address.';
    else if (control.name === 'password' && mode === 'signup' && control.value.length < 8) message = 'Use at least 8 characters for your password.';
    const error = document.getElementById(control.id + '-error'); error.textContent = message; error.hidden = !message;
    if (message) control.setAttribute('aria-invalid', 'true'); else control.removeAttribute('aria-invalid');
    return !message;
  }
  // Simulate the UI only: values never leave this document or enter persistent storage.
  form.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = [...form.querySelectorAll('input, textarea')].filter(control => !validate(control));
    const status = document.getElementById('form-status');
    if (invalid.length) { status.textContent = 'Please check the highlighted fields.'; invalid[0].focus(); return; }
    form.reset(); status.textContent = ''; form.hidden = true;
    document.getElementById('confirmation-description').textContent = settings.confirmation;
    const confirmation = document.getElementById('preview-confirmation'); confirmation.hidden = false; confirmation.focus();
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-conversion]'); if (!link) return;
    const detail = { persona, action: link.dataset.conversion, label: link.textContent.trim(), section: 'preview-' + mode };
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'cta_clicked', ...detail });
    dispatchEvent(new CustomEvent('ezrewards:cta_clicked', { detail }));
  });
  addEventListener('pagehide', () => form.reset());
})();
