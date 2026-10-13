/* Run before CSS to avoid painting a saved Dark preference as Light. */
(function () {
  let theme = 'light';
  try { if (localStorage.getItem('oney-fhc-theme') === 'dark') theme = 'dark'; } catch (e) {}
  document.documentElement.setAttribute('data-theme', theme);
})();
