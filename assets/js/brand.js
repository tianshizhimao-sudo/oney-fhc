/* =========================================================
   Shared brand chrome: theme switcher, nav hamburger, reveal
   ========================================================= */
(function () {
  const STORAGE_THEME = 'oney-fhc-theme';

  // Theme: dark | purple | light
  function applyTheme(theme, { skipTransition = false } = {}) {
    const html = document.documentElement;
    if (skipTransition) html.classList.add('no-transition');
    html.setAttribute('data-theme', theme);
    if (skipTransition) requestAnimationFrame(() => html.classList.remove('no-transition'));

    document.querySelectorAll('.theme-dot').forEach(dot => {
      const active = dot.getAttribute('data-theme') === theme;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-checked', active ? 'true' : 'false');
    });
    try { localStorage.setItem(STORAGE_THEME, theme); } catch (e) {}
  }

  function initTheme() {
    let saved = 'dark';
    try { saved = localStorage.getItem(STORAGE_THEME) || 'dark'; } catch (e) {}
    applyTheme(saved, { skipTransition: true });

    document.querySelectorAll('.theme-dot').forEach(dot => {
      dot.addEventListener('click', () => applyTheme(dot.getAttribute('data-theme')));
      dot.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          applyTheme(dot.getAttribute('data-theme'));
        }
      });
    });
  }

  function initNav() {
    const nav = document.querySelector('.oney-nav');
    if (!nav) return;
    const hamburger = nav.querySelector('.nav-hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', () => nav.classList.toggle('nav-open'));
    }
  }

  function initReveal() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const elements = document.querySelectorAll('.fade-up');
    if (reduced || !('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    elements.forEach(el => io.observe(el));
  }

  function init() {
    initTheme();
    initNav();
    initReveal();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
