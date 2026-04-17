/* =========================================================
   Schema-driven assessment engine
   OneyToolEngine.create({ name, schema, score })

   Extensibility hooks:
     step.onRender(state, stepEl, save)          - imperative DOM after render
     step.beforeNext(state, stepEl)              - async-capable gate; return
                                                    Promise<true|string[]> or
                                                    true / string[] of errors.
     step.validate(state)                        - sync extra validation
     field.render(state, field)                  - returns HTML (overrides type)
     field.validate(value, state)                - returns string[] errors
     result.transform(result, state)             - mutates/returns final result
                                                    (attached on config.score output)
   ========================================================= */
(function () {
  const UI = window.OneyToolUI;
  const STORAGE_PREFIX = 'oney-fhc';

  function storageKeyFor(name) { return STORAGE_PREFIX + '-' + name; }

  function loadState(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function saveState(key, state) {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
  }

  function track(name, payload) {
    if (window.OneyAnalytics && typeof window.OneyAnalytics.track === 'function') {
      try { window.OneyAnalytics.track(name, payload || {}); } catch (e) { /* swallow */ }
    }
  }

  function validateStep(step, state) {
    const missing = [];
    const fieldErrors = [];
    (step.fields || []).forEach(field => {
      const v = state[field.key];
      // Custom field validator always runs, even on optional fields.
      if (typeof field.validate === 'function') {
        const errs = field.validate(v, state) || [];
        errs.forEach(e => fieldErrors.push(e));
      }
      if (field.optional) return;
      if (field.type === 'multi') {
        if (!Array.isArray(v) || v.length === 0) missing.push(field.label || field.key);
      } else if (v == null || v === '' || (typeof v === 'number' && isNaN(v))) {
        missing.push(field.label || field.key);
      }
    });
    return { missing, fieldErrors };
  }

  function create(config) {
    const {
      name,
      schema,
      score,
      transform,           // result.transform hook
      mountIds = { step: 'stepMount', progress: 'progressRail', support: 'supportCopy', result: 'resultMount' },
      restartHref = null,
    } = config;

    const storageKey = storageKeyFor(name);
    const state = loadState(storageKey);
    let index = 0;
    let showingResult = false;
    let firstRender = true;
    let autoAdvanceTimer = null;

    const stepEl = document.getElementById(mountIds.step);
    const progressEl = document.getElementById(mountIds.progress);
    const supportEl = document.getElementById(mountIds.support);
    const resultEl = document.getElementById(mountIds.result);

    function currentStep() { return schema[index]; }

    track('tool_open', { tool: name, total_steps: schema.length });

    function renderCurrent() {
      if (showingResult) return;
      const step = currentStep();
      progressEl.innerHTML = UI.renderProgress(index, schema.length);
      supportEl.innerHTML = UI.renderSupport(step);
      stepEl.innerHTML = UI.renderStep(step, {
        index, total: schema.length, state, isLast: index === schema.length - 1
      });
      wireFieldEvents();
      wireActions();
      if (typeof step.onRender === 'function') {
        try { step.onRender(state, stepEl, () => saveState(storageKey, state)); } catch (e) { console.warn(e); }
      }
      // Skip scroll on first render so the hero stays visible to new arrivals.
      if (!firstRender) stepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      firstRender = false;
      track('step_view', { tool: name, step_id: step.id, step_index: index });
    }

    function wireFieldEvents() {
      // Direct handlers for schema-rendered fields.
      stepEl.querySelectorAll('.choice-card').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.field;
          const value = btn.dataset.value;
          clearTimeout(autoAdvanceTimer);
          if (btn.dataset.multi) {
            const field = currentStep().fields.find(f => f.key === key);
            const excl = (field && field.exclusive) || [];
            const arr = Array.isArray(state[key]) ? state[key].slice() : [];
            const idx = arr.indexOf(value);
            if (idx >= 0) {
              arr.splice(idx, 1);
            } else if (excl.includes(value)) {
              arr.length = 0;
              arr.push(value);
            } else {
              excl.forEach(ev => { const ei = arr.indexOf(ev); if (ei >= 0) arr.splice(ei, 1); });
              arr.push(value);
            }
            state[key] = arr;
            stepEl.querySelectorAll(`.choice-card[data-field="${CSS.escape(key)}"]`).forEach(b => {
              b.classList.toggle('selected', arr.includes(b.dataset.value));
            });
          } else {
            state[key] = value;
            stepEl.querySelectorAll(`.choice-card[data-field="${CSS.escape(key)}"]`).forEach(b => {
              b.classList.toggle('selected', b === btn);
            });
            // P1: auto-advance when all required fields in this step are filled.
            const step = currentStep();
            const allFilled = (step.fields || []).every(f => {
              if (f.optional) return true;
              const val = state[f.key];
              if (f.type === 'multi') return Array.isArray(val) && val.length > 0;
              return val != null && val !== '';
            });
            if (allFilled) {
              autoAdvanceTimer = setTimeout(goNext, 320);
            }
          }
          saveState(storageKey, state);
          clearStepErrors();
        });
      });

      stepEl.querySelectorAll('.field-input, .field-select').forEach(input => {
        if (input.dataset.field) {
          input.addEventListener('input', e => {
            const key = e.target.dataset.field;
            let v = e.target.value;
            if (e.target.type === 'number') v = v === '' ? '' : parseFloat(v);
            state[key] = v;
            saveState(storageKey, state);
            clearStepErrors();
          });
        }
      });
    }

    // Attach delegated error-clearing listeners to stepEl ONCE — stepEl persists
    // across re-renders, so attaching per-render would leak listeners.
    stepEl.addEventListener('input', clearStepErrors, true);
    stepEl.addEventListener('change', clearStepErrors, true);

    function wireActions() {
      const next = stepEl.querySelector('[data-action="next"]');
      const back = stepEl.querySelector('[data-action="back"]');
      if (next) next.addEventListener('click', goNext);
      if (back) back.addEventListener('click', goBack);
    }

    function clearStepErrors() {
      const existing = stepEl.querySelector('.step-validation');
      if (existing) existing.remove();
    }

    function goNext() {
      const step = currentStep();
      const { missing, fieldErrors } = validateStep(step, state);
      const stepExtra = (typeof step.validate === 'function') ? (step.validate(state) || []) : [];
      const errors = [];
      if (missing.length > 0) errors.push(`Please answer: ${missing.join(', ')}`);
      fieldErrors.forEach(e => errors.push(e));
      stepExtra.forEach(e => errors.push(e));

      if (errors.length > 0) {
        flashErrors(errors);
        track('step_validation_fail', { tool: name, step_id: step.id, errors: errors.length });
        return;
      }

      // beforeNext can be sync or async; can return true | string[] | Promise.
      const btn = stepEl.querySelector('[data-action="next"]');
      const setLoading = (on, label) => {
        if (!btn) return;
        if (on) {
          btn.disabled = true;
          btn.classList.add('btn-loading');
          btn.dataset.originalLabel = btn.dataset.originalLabel || btn.innerHTML;
          btn.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span><span>${UI.esc(label || 'Checking…')}</span>`;
          btn.setAttribute('aria-busy', 'true');
        } else {
          btn.disabled = false;
          btn.classList.remove('btn-loading');
          btn.removeAttribute('aria-busy');
          if (btn.dataset.originalLabel) { btn.innerHTML = btn.dataset.originalLabel; delete btn.dataset.originalLabel; }
        }
      };
      const afterGate = (gateResult) => {
        setLoading(false);
        if (Array.isArray(gateResult) && gateResult.length) {
          flashErrors(gateResult);
          track('step_validation_fail', { tool: name, step_id: step.id, errors: gateResult.length, source: 'beforeNext' });
          return;
        }
        if (gateResult === false) return;
        track('step_complete', { tool: name, step_id: step.id, step_index: index });
        if (index < schema.length - 1) { index++; renderCurrent(); }
        else { showResult(); }
      };
      if (typeof step.beforeNext === 'function') {
        let out;
        try { out = step.beforeNext(state, stepEl); } catch (e) { console.warn(e); out = true; }
        if (out && typeof out.then === 'function') {
          setLoading(true, step.loadingLabel || 'Checking…');
          out.then(afterGate).catch(err => {
            console.warn(err);
            setLoading(false);
            flashErrors(['Something went wrong — please try again.']);
          });
        } else {
          afterGate(out);
        }
      } else {
        afterGate(true);
      }
    }

    function goBack() {
      clearTimeout(autoAdvanceTimer);
      if (index > 0) { index--; renderCurrent(); }
    }

    function flashErrors(errors) {
      const toast = document.createElement('div');
      toast.className = 'step-validation';
      toast.setAttribute('role', 'alert');
      const items = errors.map(e => `<li>${UI.esc(e)}</li>`).join('');
      toast.innerHTML = `<strong class="step-validation-title">Please check:</strong>
        <ul class="step-validation-list">${items}</ul>`;
      clearStepErrors();
      const actions = stepEl.querySelector('.step-actions');
      if (actions) actions.parentNode.insertBefore(toast, actions);
      toast.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function applyResultTransform(result) {
      if (typeof transform === 'function') {
        try { const out = transform(result, state); if (out && typeof out === 'object') return out; }
        catch (e) { console.warn(e); }
      }
      return result;
    }

    function showResult() {
      showingResult = true;
      progressEl.innerHTML = UI.renderProgress(schema.length - 1, schema.length);
      let result = score(state) || {};
      result = applyResultTransform(result);

      const parts = [];
      parts.push(UI.renderScoreHero(result.score || 0, result.heading || 'Your result', result.summary || ''));
      if (result.metrics) parts.push(UI.renderMetricGrid(result.metrics));
      if (result.routeCard) parts.push(result.routeCard);

      // Auto-expand: when score is in the weak band (<45), mark up to 2 highest-priority
      // attention cards (danger > warn) so mobile users see them without tapping.
      const autoExpand = computeAutoExpand(result);
      if (result.attention && result.attention.length) {
        parts.push(UI.renderInsightList('Areas needing attention', result.attention, { autoExpand }));
      }
      if (result.positives && result.positives.length) {
        parts.push(UI.renderInsightList('Looking good', result.positives));
      }

      // Email capture for moderate/weak scores (< 70) — mailto fallback.
      const emailHtml = UI.renderEmailCapture(result, name);
      if (emailHtml) parts.push(emailHtml);

      // Layered CTA block: Primary, Secondary, Tertiary text link.
      if (result.cta) parts.push(renderLayeredCTA(result.cta, name));

      resultEl.innerHTML = parts.join('');
      resultEl.hidden = false;
      stepEl.hidden = true;
      if (supportEl && supportEl.parentElement) supportEl.parentElement.style.display = 'none';
      UI.wireInsightAccordions(resultEl);

      // Fire events in natural order: result_view → route_recommendation_shown → insight visibility.
      track('result_view', { tool: name, score: result.score || 0 });
      // Quiz is the only tool that produces a route recommendation card. Emit a single
      // event with an explicit unique_id (tool+route+score band) so Plausible queries
      // can dedupe if the user returns and re-views the same result.
      if (result.routeCard && result.routeKey) {
        const band = (result.score || 0) >= 70 ? 'strong' : (result.score || 0) >= 45 ? 'moderate' : 'weak';
        track('route_recommendation_shown', {
          tool: name,
          route: result.routeKey,
          score_band: band,
          unique_id: `${name}:${result.routeKey}:${band}`,
        });
      }
      if (autoExpand > 0) track('low_score_auto_expand', { tool: name, expanded: autoExpand, score: result.score || 0 });

      // Wire CTA click analytics
      resultEl.querySelectorAll('.result-cta a, .result-cta button[data-href], .route-card a').forEach(a => {
        a.addEventListener('click', () => {
          const kind = a.closest('.route-card') ? 'specialist_tool_click' : 'cta_click';
          const tier = a.dataset.ctaTier || 'primary';
          track(kind, { tool: name, href: a.getAttribute('href') || a.dataset.href, label: (a.textContent || '').trim(), tier });
        });
      });
      resultEl.querySelectorAll('[data-wrongtool]').forEach(a => {
        a.addEventListener('click', () => {
          track('wrong_tool_exit', { from: name, href: a.getAttribute('href'), label: (a.textContent || '').trim() });
        });
      });

      wireEmailCapture(result);
      wireRestart();
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function buildMailtoFallback(email, result) {
      var toolLabels = { quiz: 'Quick Check', payg: 'PAYG Health Check', business: 'Business Health Check', investor: 'Investor Portfolio Check' };
      var label = toolLabels[name] || 'Health Check';
      var subject = 'FHC Report Request \u2014 ' + label + ' \u2014 Score ' + (result.score || 0) + '/100';
      var body = 'Hi Oney & Co,\n\nI just completed the ' + label + ' and scored ' + (result.score || 0) + '/100.\n\nMy email: ' + email + '\n\n';
      if (result.heading) body += 'Summary: ' + result.heading + '\n\n';
      if (result.attention && result.attention.length) {
        body += 'Areas to work on:\n';
        result.attention.forEach(function (a) { body += '\u2022 ' + a.title + '\n'; });
        body += '\n';
      }
      if (result.positives && result.positives.length) {
        body += 'Strengths:\n';
        result.positives.forEach(function (p) { body += '\u2022 ' + p.title + '\n'; });
        body += '\n';
      }
      body += 'I\u2019d like to receive my full report and discuss next steps.\n\nThanks';
      return 'mailto:hello@oneyco.com.au?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }

    function wireEmailCapture(result) {
      var form = document.getElementById('emailCaptureForm');
      if (!form) return;
      var SUPABASE_URL = 'https://syhwaeloljdswsmqkzrx.supabase.co';
      var SUPABASE_KEY = 'sb_publishable_kQrtxdvnex0ObqoI0UXNLQ_-1FVABOM';

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = document.getElementById('emailCaptureInput');
        var btn = document.getElementById('emailCaptureBtn');
        var email = (input.value || '').trim();
        if (!email) return;

        btn.disabled = true;
        btn.textContent = 'Sending\u2026';

        fetch(SUPABASE_URL + '/functions/v1/fhc-early-bird', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_KEY },
          body: JSON.stringify({ email: email, source: 'fhc-report', tool: name, score: result.score || 0 })
        })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, data: d }; }); })
        .then(function (out) {
          if (out.ok && out.data.success) {
            form.hidden = true;
            document.getElementById('emailCaptureSuccess').hidden = false;
            track('result_email_capture', { tool: name, score: result.score || 0, method: 'resend' });
          } else {
            throw new Error(out.data.error || 'Request failed');
          }
        })
        .catch(function () {
          form.hidden = true;
          var errorEl = document.getElementById('emailCaptureError');
          if (errorEl) errorEl.hidden = false;
          var fallbackLink = document.getElementById('emailCaptureFallback');
          if (fallbackLink) {
            fallbackLink.href = buildMailtoFallback(email, result);
            fallbackLink.addEventListener('click', function () {
              track('result_email_capture', { tool: name, score: result.score || 0, method: 'mailto_fallback' });
            });
          }
          track('result_email_capture_error', { tool: name, score: result.score || 0 });
        });
      });
    }

    function computeAutoExpand(result) {
      if (!result.attention || !result.attention.length) return 0;
      if ((result.score || 100) >= 45) return 0;
      // Prioritise danger tone first, then warn. Cap at 2.
      const priority = result.attention
        .map((a, i) => ({ i, tone: a.tone || 'warn' }))
        .sort((a, b) => (a.tone === 'danger' ? 0 : 1) - (b.tone === 'danger' ? 0 : 1));
      const count = Math.min(2, priority.length);
      result.attention = result.attention.map((a, i) => ({
        ...a,
        _expanded: priority.slice(0, count).some(p => p.i === i)
      }));
      return count;
    }

    function renderLayeredCTA(cta, toolName) {
      // cta can have: primary, secondary, tertiary (each { label, href })
      // Back-compat: if only cta.actions exists, map first=primary, second=secondary.
      let primary = cta.primary, secondary = cta.secondary, tertiary = cta.tertiary;
      if (!primary && Array.isArray(cta.actions)) {
        primary = cta.actions.find(a => a.primary) || cta.actions[0];
        secondary = cta.actions.find(a => !a.primary && a !== primary);
      }

      const primaryHtml = primary ? `<a class="btn-purple cta-primary" href="${UI.esc(primary.href)}" data-cta-tier="primary">${UI.esc(primary.label)} →</a>` : '';
      const secondaryHtml = secondary ? `<a class="btn-ghost cta-secondary" href="${UI.esc(secondary.href)}" data-cta-tier="secondary">${UI.esc(secondary.label)}</a>` : '';
      const tertiaryHtml = tertiary ? `<a class="cta-tertiary" href="${UI.esc(tertiary.href)}" data-cta-tier="tertiary">${UI.esc(tertiary.label)} ↗</a>` : '';

      // Wrong-tool block lives within the same CTA card (tertiary row), specialist tools only.
      let wrongToolHtml = '';
      if (toolName !== 'quiz') {
        const altMap = {
          payg:     { label: "Not salaried?",          alts: [['business.html','Business Check'],['investor.html','Investor Check']] },
          business: { label: "Not self-employed?",     alts: [['payg.html','PAYG Check'],['investor.html','Investor Check']] },
          investor: { label: "No existing properties?", alts: [['payg.html','PAYG Check'],['business.html','Business Check']] },
        };
        const alt = altMap[toolName];
        if (alt) {
          const linkHtml = alt.alts.map(([h,l]) => `<a href="${h}" data-wrongtool="${toolName}">${UI.esc(l)}</a>`).join(' · ');
          wrongToolHtml = `<div class="wrong-tool-link">
            <span>${UI.esc(alt.label)}</span>
            <div class="wrong-tool-alts">${linkHtml} · <a href="quiz.html" data-wrongtool="${toolName}">Back to Quick Check</a></div>
          </div>`;
        }
      }

      return `<div class="result-cta">
        <h3>${UI.esc(cta.title)}</h3>
        <p>${UI.esc(cta.body)}</p>
        <div class="cta-stack">
          ${primaryHtml}
          ${secondaryHtml}
        </div>
        ${tertiaryHtml ? `<div class="cta-tertiary-row">${tertiaryHtml}</div>` : ''}
        ${wrongToolHtml}
        <button type="button" class="cta-restart-link" id="restartAssessment">Start the assessment over</button>
      </div>`;
    }

    function wireRestart() {
      const restartBtn = document.getElementById('restartAssessment');
      if (!restartBtn) return;
      let armed = false;
      let timer;
      restartBtn.addEventListener('click', () => {
        if (!armed) {
          armed = true;
          restartBtn.textContent = 'Tap again to confirm reset';
          restartBtn.classList.add('armed');
          clearTimeout(timer);
          timer = setTimeout(() => {
            armed = false;
            restartBtn.textContent = 'Start the assessment over';
            restartBtn.classList.remove('armed');
          }, 3500);
          return;
        }
        track('tool_restart', { tool: name });
        try { localStorage.removeItem(storageKey); } catch (e) {}
        if (restartHref) { window.location.href = restartHref; return; }
        window.location.reload();
      });
    }

    renderCurrent();
    return { state, goNext, goBack, showResult };
  }

  window.OneyToolEngine = { create, storageKeyFor, loadState, saveState, track };
})();
