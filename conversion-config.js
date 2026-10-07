/* Shared conversion copy and personality-aware routes. */
(() => {
  const personas = ['default', 'visionary', 'strategist', 'operator', 'creative-culture-builder'];
  const labels = Object.freeze({ navSignup: 'Create Account', signin: 'Sign in', signup: 'Create your account', join: 'Join EzRewards', demo: 'Book a Demo' });
  const routes = Object.freeze({ signup: '/signup.html', signin: '/signin.html', demo: '/demo.html', home: '/' });
  const validPersona = value => personas.includes(value);
  function resolvePersona() {
    const query = new URLSearchParams(location.search).get('persona');
    if (query !== null) return validPersona(query) ? query : 'default';
    try { const saved = localStorage.getItem('ezrewards-persona'); if (validPersona(saved)) return saved; } catch {}
    return 'default';
  }
  function href(action, persona) {
    const route = routes[action];
    if (!route) throw new Error('Unknown conversion action');
    return route + '?persona=' + encodeURIComponent(validPersona(persona) ? persona : 'default');
  }
  function updateLinks(persona, root = document) {
    root.querySelectorAll('[data-conversion]').forEach(link => {
      const owner = link.closest('.persona-header') && ['signup', 'signin'].includes(link.dataset.conversion)
        ? 'visionary'
        : link.closest('[data-persona-page]')?.dataset.personaPage || persona;
      link.href = href(link.dataset.conversion, owner);
      if (labels[link.dataset.ctaCopy]) {
        const label = link.querySelector('[data-cta-label]');
        if (label) label.textContent = labels[link.dataset.ctaCopy];
        else link.textContent = labels[link.dataset.ctaCopy];
      }
    });
  }
  window.EzRewardsConversion = Object.freeze({ labels, routes, validPersona, resolvePersona, href, updateLinks });
})();
