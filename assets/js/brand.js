/* =========================================================
   Shared brand chrome: theme switcher, nav hamburger, reveal
   ========================================================= */
(function () {
  const STORAGE_THEME = 'oney-fhc-theme';

  // Only explicit Dark is dark. Legacy Purple/invalid values migrate to Light.
  function applyTheme(value, { skipTransition = false } = {}) {
    const theme = value === 'dark' ? 'dark' : 'light';
    const html = document.documentElement;
    if (skipTransition) html.classList.add('no-transition');
    html.setAttribute('data-theme', theme);
    if (skipTransition) requestAnimationFrame(() => html.classList.remove('no-transition'));
    document.querySelectorAll('.theme-dot').forEach(button => {
      const active = button.getAttribute('data-theme') === theme;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#17131E' : '#F2F4F3';
    try { localStorage.setItem(STORAGE_THEME, theme); } catch (e) {}
  }

  function initTheme() {
    let saved = 'light';
    try { saved = localStorage.getItem(STORAGE_THEME) || 'light'; } catch (e) {}
    applyTheme(saved, { skipTransition: true });
    // Native buttons supply Enter/Space activation without duplicate key handlers.
    document.querySelectorAll('.theme-dot').forEach(button => {
      button.addEventListener('click', () => applyTheme(button.getAttribute('data-theme')));
    });
  }

  function initNav() {
    const nav = document.querySelector('.oney-nav');
    if (!nav) return;
    const hamburger = nav.querySelector('.nav-hamburger');
    const links = nav.querySelector('.nav-links');
    if (!hamburger || !links) return;
    const mobile = window.matchMedia('(max-width: 768px)');
    function setOpen(open, returnFocus = false) {
      open = mobile.matches && open;
      nav.classList.toggle('nav-open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      links.hidden = mobile.matches && !open;
      if (returnFocus) hamburger.focus();
    }
    hamburger.addEventListener('click', () => setOpen(!nav.classList.contains('nav-open')));
    nav.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('nav-open')) {
        event.preventDefault();
        setOpen(false, true);
      }
    });
    links.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false, mobile.matches);
    });
    document.addEventListener('click', event => {
      if (nav.classList.contains('nav-open') && !nav.contains(event.target)) {
        setOpen(false, links.contains(document.activeElement));
      }
    });
    nav.addEventListener('focusout', () => {
      // A disclosure, not a modal: normal Tab can leave the menu.
      queueMicrotask(() => {
        if (nav.classList.contains('nav-open') && !nav.contains(document.activeElement)) setOpen(false);
      });
    });
    mobile.addEventListener('change', () => {
      const focusWasInLinks = links.contains(document.activeElement);
      setOpen(false, mobile.matches && focusWasInLinks);
      if (!mobile.matches && document.activeElement === hamburger) links.querySelector('a')?.focus();
    });
    setOpen(false);
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
