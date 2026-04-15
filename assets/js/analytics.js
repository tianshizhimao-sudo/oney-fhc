/* =========================================================
   Oney FHC — analytics hook layer
   One thin wrapper so the rest of the code only ever calls:
       OneyAnalytics.track(name, payload)
   Underlying platforms (gtag / Plausible / PostHog) can plug in
   by providing window.OneyAnalyticsAdapter = { send(name, payload) }.
   Events: tool_open, step_view, step_complete, step_validation_fail,
           result_view, route_recommendation_shown, specialist_tool_click,
           cta_click, tool_restart, page_view
   ========================================================= */
(function () {
  const DEBUG = /[?&]oney_debug=1/.test(location.search);
  const DNT = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const queue = [];
  let flushed = false;

  // Auto-inject Plausible if a domain meta tag is present and script not already loaded.
  // Usage: <meta name="oney-analytics-domain" content="fhc.oneyco.com.au">
  // Host override (e.g. self-hosted): <meta name="oney-analytics-host" content="https://plausible.io">
  function installPlausible() {
    if (DNT) return;
    if (typeof window.plausible === 'function') return;
    const domainMeta = document.querySelector('meta[name="oney-analytics-domain"]');
    if (!domainMeta) return;
    const domain = domainMeta.getAttribute('content');
    if (!domain) return;
    const hostMeta = document.querySelector('meta[name="oney-analytics-host"]');
    const host = (hostMeta && hostMeta.getAttribute('content')) || 'https://plausible.io';
    // Queue fn in case events fire before script loads.
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    const s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', domain);
    s.src = host.replace(/\/$/, '') + '/js/script.tagged-events.js';
    document.head.appendChild(s);
  }

  function send(name, payload) {
    if (DNT) { if (DEBUG) console.log('[oney-analytics] DNT on, skipped', name); return; }
    const adapter = window.OneyAnalyticsAdapter;
    if (adapter && typeof adapter.send === 'function') {
      try { adapter.send(name, payload); } catch (e) { /* ignore */ }
    }
    // Also forward to gtag / dataLayer / plausible if present — zero-config fallbacks.
    if (typeof window.gtag === 'function') {
      try { window.gtag('event', name, payload || {}); } catch (e) {}
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: name }, payload || {}));
    }
    if (typeof window.plausible === 'function') {
      try { window.plausible(name, { props: payload || {} }); } catch (e) {}
    }
    if (DEBUG) console.log('[oney-analytics]', name, payload || {});
  }

  function track(name, payload) {
    if (!name) return;
    const evt = Object.assign({ ts: Date.now(), path: location.pathname }, payload || {});
    if (!flushed) { queue.push([name, evt]); return; }
    send(name, evt);
  }

  function flush() {
    flushed = true;
    while (queue.length) {
      const [n, p] = queue.shift();
      send(n, p);
    }
  }

  function init() {
    installPlausible();
    flush();
    track('page_view', { title: document.title });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.OneyAnalytics = { track, flush };
})();
