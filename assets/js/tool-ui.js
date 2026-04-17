/* =========================================================
   Shared tool UI renderers (step + results)
   Exposes window.OneyToolUI
   ========================================================= */
(function () {
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderField(field, state) {
    // Custom field renderer takes full control of the row.
    if (typeof field.render === 'function') {
      try { return field.render(state, field) || ''; } catch (e) { console.warn(e); return ''; }
    }
    const v = state[field.key];
    const hint = field.hint ? `<span class="field-hint">${esc(field.hint)}</span>` : '';
    const label = field.label ? `<label class="field-label" for="f_${field.key}">${esc(field.label)}</label>` : '';

    if (field.type === 'choice') {
      const cols = field.cols === 2 ? 'cols-2' : field.cols === 1 ? 'single' : '';
      const opts = field.options.map(opt => {
        const value = typeof opt === 'object' ? opt.value : opt;
        const text = typeof opt === 'object' ? opt.label : opt;
        const selected = v === value ? 'selected' : '';
        return `<button type="button" class="choice-card ${selected}" data-field="${esc(field.key)}" data-value="${esc(value)}">
          <span class="choice-dot"></span><span>${esc(text)}</span>
        </button>`;
      }).join('');
      return `<div class="field-row">${label}<div class="choice-grid ${cols}">${opts}</div>${hint}</div>`;
    }

    if (field.type === 'multi') {
      const arr = Array.isArray(v) ? v : [];
      const cols = field.cols === 2 ? 'cols-2' : field.cols === 1 ? 'single' : '';
      const opts = field.options.map(opt => {
        const value = typeof opt === 'object' ? opt.value : opt;
        const text = typeof opt === 'object' ? opt.label : opt;
        const selected = arr.includes(value) ? 'selected' : '';
        return `<button type="button" class="choice-card ${selected}" data-field="${esc(field.key)}" data-multi="1" data-value="${esc(value)}">
          <span class="choice-dot"></span><span>${esc(text)}</span>
        </button>`;
      }).join('');
      return `<div class="field-row">${label}<div class="choice-grid ${cols}">${opts}</div>${hint}</div>`;
    }

    if (field.type === 'number' || field.type === 'currency') {
      const prefix = field.type === 'currency' ? '<span class="field-prefix">$</span>' : '';
      const wrap = field.type === 'currency' ? 'field-prefix-wrap' : '';
      return `<div class="field-row">${label}
        <div class="${wrap}">${prefix}
          <input type="number" id="f_${esc(field.key)}" class="field-input" data-field="${esc(field.key)}" placeholder="${esc(field.placeholder || '')}" value="${v == null ? '' : esc(v)}" ${field.min != null ? `min="${field.min}"` : ''} ${field.step ? `step="${field.step}"` : ''}>
        </div>${hint}</div>`;
    }

    if (field.type === 'text') {
      return `<div class="field-row">${label}
        <input type="text" id="f_${esc(field.key)}" class="field-input" data-field="${esc(field.key)}" placeholder="${esc(field.placeholder || '')}" value="${v == null ? '' : esc(v)}">${hint}</div>`;
    }

    if (field.type === 'select') {
      const opts = field.options.map(opt => {
        const value = typeof opt === 'object' ? opt.value : opt;
        const text = typeof opt === 'object' ? opt.label : opt;
        return `<option value="${esc(value)}" ${v === value ? 'selected' : ''}>${esc(text)}</option>`;
      }).join('');
      return `<div class="field-row">${label}
        <select class="field-select" data-field="${esc(field.key)}">
          <option value="">Select…</option>${opts}
        </select>${hint}</div>`;
    }

    return '';
  }

  function renderStep(step, ctx) {
    const { index, total, state, isLast } = ctx;
    const fieldsHtml = (step.fields || []).map(f => renderField(f, state)).join('');
    const helper = step.helper ? `<div class="helper-callout">${step.helper}</div>` : '';
    const backBtn = index > 0 ? '<button type="button" class="btn-ghost" data-action="back">← Back</button>' : '<span></span>';
    const nextLabel = isLast ? 'See results' : 'Continue';
    return `
      <div class="step-card-inner fade-up visible">
        <div class="step-meta">Step ${index + 1} of ${total}</div>
        <h2>${esc(step.title)}</h2>
        ${step.description ? `<p class="step-desc">${esc(step.description)}</p>` : ''}
        <div class="step-fields">${fieldsHtml}</div>
        ${helper}
        <div class="step-actions">
          ${backBtn}
          <button type="button" class="btn-purple" data-action="next">${nextLabel} →</button>
        </div>
      </div>
    `;
  }

  function renderProgress(index, total) {
    const pct = total <= 1 ? (index >= total - 1 ? 100 : 0) : Math.round((index / (total - 1)) * 100);
    return `
      <div class="progress-rail-head">
        <span>Progress</span><strong>${Math.min(index + 1, total)} / ${total}</strong>
      </div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    `;
  }

  function renderSupport(step) {
    const title = step.supportTitle || 'Why this matters';
    const body = step.supportBody || 'Each step builds toward a clearer picture. We keep answers local, so nothing is shared.';
    const listItems = (step.supportList || []).map(i => `<li class="support-list-item">${esc(i)}</li>`).join('');
    const list = listItems ? `<ul class="support-list" style="list-style:none; padding:0; margin:14px 0 0;">${listItems}</ul>` : '';
    return `
      <div class="support-kicker">${esc(step.supportKicker || 'Assessment')}</div>
      <h3>${esc(title)}</h3>
      <p>${esc(body)}</p>
      ${list}
      <div class="support-trust">Your answers stay in your browser. No sign-up required.</div>
    `;
  }

  // ---- Results helpers ----
  function scoreBand(score) {
    if (score >= 70) return { tone: 'strong', label: 'Strong', color: '#2ECC85' };
    if (score >= 45) return { tone: 'moderate', label: 'Moderate', color: '#F59E0B' };
    return { tone: 'weak', label: 'Needs attention', color: '#EF4444' };
  }

  function renderScoreHero(score, heading, summary) {
    const band = scoreBand(score);
    const pct = Math.max(0, Math.min(100, Math.round(score)));
    return `
      <div class="score-hero fade-up visible">
        <div class="score-hero-inner">
          <div class="score-ring" style="--score-pct:${pct}; --score-color:${band.color};">
            <span class="score-ring-value">${pct}<small>/100</small></span>
          </div>
          <div class="score-hero-copy">
            <span class="score-band ${band.tone}">${band.label}</span>
            <h2>${esc(heading)}</h2>
            <p>${esc(summary)}</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderMetricGrid(metrics) {
    if (!metrics || !metrics.length) return '';
    const cards = metrics.map(m => {
      const cls = m.tone ? `metric-${m.tone}` : '';
      const bar = m.bar != null
        ? `<div class="metric-bar"><div class="metric-bar-fill ${m.barTone || ''}" style="width:${Math.max(0, Math.min(100, m.bar))}%"></div></div>`
        : '';
      const sub = m.sub ? `<div class="metric-sub">${esc(m.sub)}</div>` : '';
      return `<div class="metric-card ${cls}">
        <div class="metric-label">${esc(m.label)}</div>
        <div class="metric-value">${m.valueHtml || esc(m.value)}</div>
        ${sub}${bar}
      </div>`;
    }).join('');
    return `<div class="result-section">
      <div class="result-section-title">Key metrics</div>
      <div class="metric-grid">${cards}</div>
    </div>`;
  }

  function renderInsightList(title, insights, opts) {
    if (!insights || !insights.length) return '';
    const cards = insights.map(i => {
      const expanded = i._expanded ? ' expanded no-anim' : '';
      const ariaExp = i._expanded ? 'true' : 'false';
      return `
      <article class="insight-card tone-${esc(i.tone || 'warn')}${expanded}">
        <button type="button" class="insight-card-header" aria-expanded="${ariaExp}">
          <span class="insight-accent"></span>
          <span class="insight-icon">${i.icon || '•'}</span>
          <span class="insight-title">${esc(i.title)}</span>
          <span class="insight-arrow">›</span>
        </button>
        <div class="insight-card-body"><p>${esc(i.body)}</p></div>
      </article>`;
    }).join('');
    return `<div class="result-section">
      <div class="result-section-title">${esc(title)}</div>
      <div class="insight-list">${cards}</div>
    </div>`;
  }

  function renderResultCTA(cta) {
    if (!cta) return '';
    const actions = (cta.actions || []).map(a => {
      const cls = a.primary ? 'btn-purple' : 'btn-ghost';
      return `<a class="${cls}" href="${esc(a.href)}">${esc(a.label)} →</a>`;
    }).join('');
    return `<div class="result-cta">
      <h3>${esc(cta.title)}</h3>
      <p>${esc(cta.body)}</p>
      <div class="result-cta-actions">${actions}</div>
    </div>`;
  }

  function wireInsightAccordions(root) {
    // After first paint, re-enable transitions on pre-expanded cards so user
    // interaction animates normally.
    requestAnimationFrame(() => {
      root.querySelectorAll('.insight-card.no-anim').forEach(c => c.classList.remove('no-anim'));
    });
    root.querySelectorAll('.insight-card').forEach(card => {
      const header = card.querySelector('.insight-card-header');
      if (!header) return;
      header.addEventListener('click', () => {
        card.classList.remove('no-anim');
        const expanded = card.classList.toggle('expanded');
        header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
    });
  }

  function renderEmailCapture(result, toolName) {
    if ((result.score || 100) >= 70) return '';
    var toolLabels = { quiz: 'Quick Check', payg: 'PAYG Health Check', business: 'Business Health Check', investor: 'Investor Portfolio Check' };
    var label = toolLabels[toolName] || 'Financial Health Check';
    return '<div class="result-email-capture">' +
      '<div class="email-capture-inner">' +
        '<h3>Get your results by email</h3>' +
        '<p>Enter your email and we\u2019ll send your ' + esc(label) + ' summary (' + (result.score || 0) + '/100) with personalised next steps you can act on.</p>' +
        '<form class="email-capture-form" id="emailCaptureForm">' +
          '<div class="email-capture-row">' +
            '<input type="email" class="field-input email-capture-input" id="emailCaptureInput" placeholder="your@email.com" required>' +
            '<button type="submit" class="btn-purple email-capture-btn" id="emailCaptureBtn">Send my report \u2192</button>' +
          '</div>' +
          '<span class="email-capture-hint">No spam. Just your results + what to do next.</span>' +
        '</form>' +
        '<div class="email-capture-success" id="emailCaptureSuccess" hidden>' +
          '<span class="email-capture-check">\u2713</span>' +
          '<p>Check your inbox \u2014 we\u2019ve sent your personalised results summary.</p>' +
        '</div>' +
        '<div class="email-capture-error" id="emailCaptureError" hidden>' +
          '<p>Something went wrong \u2014 <a href="#" id="emailCaptureFallback">click here to send via email instead</a>.</p>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  window.OneyToolUI = {
    renderStep, renderProgress, renderSupport,
    renderScoreHero, renderMetricGrid, renderInsightList, renderResultCTA,
    renderEmailCapture, wireInsightAccordions, scoreBand, esc,
  };
})();
