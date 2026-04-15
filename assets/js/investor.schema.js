/* Oney FHC — Investor schema
   Includes:
   - renderPropertyStep   (custom onRender for dynamic property list)
   - validatePropertyStep (step-level validate hook)
   - validateTargetStep   (step-level validate hook for funding/target)
*/
(function () {

  function renderPropertyStep(state, stepEl, save) {
    if (!Array.isArray(state.properties) || state.properties.length === 0) {
      state.properties = [{ value: '', loan: '', rent: '', type: 'inv' }];
      save();
    }

    let mount = stepEl.querySelector('#propertyMount');
    if (!mount) {
      const fieldsWrap = stepEl.querySelector('.step-fields');
      if (!fieldsWrap) return;
      const div = document.createElement('div');
      div.id = 'propertyMount';
      fieldsWrap.prepend(div);
      mount = div;
    }

    function draw() {
      const items = state.properties.map((p, i) => `
        <div class="property-card" data-idx="${i}">
          <div class="property-card-head">
            <span class="property-card-title">🏠 Property ${i + 1}</span>
            ${state.properties.length > 1 ? `<button type="button" class="property-remove" data-remove="${i}" aria-label="Remove property ${i+1}">×</button>` : ''}
          </div>
          <div class="property-grid">
            <div>
              <label class="field-label">Current value</label>
              <div class="field-prefix-wrap"><span class="field-prefix">$</span>
                <input type="number" class="field-input" data-prop="value" data-idx="${i}" placeholder="800000" value="${p.value ?? ''}">
              </div>
            </div>
            <div>
              <label class="field-label">Loan balance</label>
              <div class="field-prefix-wrap"><span class="field-prefix">$</span>
                <input type="number" class="field-input" data-prop="loan" data-idx="${i}" placeholder="500000" value="${p.loan ?? ''}">
              </div>
            </div>
            <div>
              <label class="field-label">Weekly rent</label>
              <div class="field-prefix-wrap"><span class="field-prefix">$</span>
                <input type="number" class="field-input" data-prop="rent" data-idx="${i}" placeholder="600" value="${p.rent ?? ''}">
              </div>
            </div>
          </div>
          <div class="property-type-toggle">
            <button type="button" class="${p.type === 'ppor' ? 'active' : ''}" data-type="ppor" data-idx="${i}">PPOR</button>
            <button type="button" class="${p.type !== 'ppor' ? 'active' : ''}" data-type="inv" data-idx="${i}">Investment</button>
          </div>
        </div>
      `).join('');
      mount.innerHTML = `
        <div class="field-row">
          <label class="field-label">Existing properties</label>
          <div class="property-list">${items}</div>
          <button type="button" class="property-add" id="propertyAddBtn">+ Add another property</button>
          <span class="field-hint">Include PPOR + investment properties. Weekly rent ignored for PPOR; leave blank if vacant.</span>
        </div>
      `;
      wireProperty();
    }

    function wireProperty() {
      mount.querySelectorAll('input[data-prop]').forEach(inp => {
        inp.addEventListener('input', e => {
          const idx = parseInt(e.target.dataset.idx, 10);
          const key = e.target.dataset.prop;
          const v = e.target.value === '' ? '' : parseFloat(e.target.value);
          state.properties[idx][key] = v;
          save();
        });
      });
      mount.querySelectorAll('button[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          state.properties[idx].type = btn.dataset.type;
          save();
          draw();
        });
      });
      mount.querySelectorAll('button[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.remove, 10);
          state.properties.splice(idx, 1);
          save();
          draw();
        });
      });
      const addBtn = mount.querySelector('#propertyAddBtn');
      if (addBtn) addBtn.addEventListener('click', () => {
        state.properties.push({ value: '', loan: '', rent: '', type: 'inv' });
        save();
        draw();
      });
    }

    draw();
  }

  // Upper-bound sanity ceilings. Anything above these almost certainly has an
  // extra zero or two. We hard-cap rather than silently ignore so the user
  // notices and corrects before seeing a misleading result.
  const MAX_PROPERTY_VALUE = 50_000_000;   // $50M single property
  const MAX_LOAN           = 50_000_000;
  const MAX_WEEKLY_RENT    = 10_000;       // $10k/wk (luxury ceiling)
  const MAX_TARGET_VALUE   = 50_000_000;
  const MAX_CASH           = 20_000_000;

  function validatePropertyStep(state) {
    const errors = [];
    const props = Array.isArray(state.properties) ? state.properties : [];
    if (props.length === 0) {
      errors.push('Add at least one property before continuing.');
      return errors;
    }
    props.forEach((p, i) => {
      const v = parseFloat(p.value);
      const l = parseFloat(p.loan);
      const rent = p.rent === '' || p.rent == null ? 0 : parseFloat(p.rent);
      const label = `Property ${i + 1}`;
      if (!(v > 0)) errors.push(`${label}: enter a current value.`);
      if (!(l >= 0) || p.loan === '' || p.loan == null) errors.push(`${label}: enter a loan balance (use 0 if owned outright).`);
      // Sanity: loan up to 110% of value (allow slight negative equity, not infinite)
      if (v > 0 && l > v * 1.1) errors.push(`${label}: loan looks higher than property value. Double-check.`);
      if (p.type !== 'ppor' && (isNaN(rent) || rent < 0)) errors.push(`${label}: weekly rent can't be negative.`);
      // Upper-bound sanity — catch extra-zero typos.
      if (v > MAX_PROPERTY_VALUE) errors.push(`${label}: value looks too high — check for extra zeros.`);
      if (!isNaN(l) && l > MAX_LOAN) errors.push(`${label}: loan balance looks too high — check for extra zeros.`);
      if (!isNaN(rent) && rent > MAX_WEEKLY_RENT) errors.push(`${label}: weekly rent looks too high — did you enter annual by mistake?`);
    });
    return errors;
  }

  function validateTargetStep(state) {
    const errors = [];
    const tv = parseFloat(state.targetValue);
    const cash = parseFloat(state.availableCash);
    const tf = state.timeframe;
    // availableCash is always required for a realistic picture
    if (state.availableCash === '' || state.availableCash == null || isNaN(cash)) {
      errors.push('Enter available cash (use 0 if none).');
    } else if (cash < 0) {
      errors.push("Available cash can't be negative.");
    } else if (cash > MAX_CASH) {
      errors.push('Available cash looks too high — check for extra zeros.');
    }
    // Only require target if timeframe implies imminent action
    const needsTarget = tf && tf !== 'Just reviewing';
    if (needsTarget && (state.targetValue === '' || state.targetValue == null || isNaN(tv))) {
      errors.push("Enter a target purchase price (or choose 'Just reviewing' to skip).");
    }
    if (!isNaN(tv) && tv > 0 && tv < 50000) {
      errors.push('Target purchase price looks too low — double-check the number.');
    }
    if (!isNaN(tv) && tv > MAX_TARGET_VALUE) {
      errors.push('Target purchase price looks too high — check for extra zeros.');
    }
    return errors;
  }

  // Income step: cap salary too so a 6-figure typo is caught early.
  function validateIncomeStep(state) {
    const errors = [];
    const salary = parseFloat(state.salary);
    const other = parseFloat(state.otherIncome);
    if (!isNaN(salary) && salary > 10_000_000) errors.push('Gross salary looks too high — check for extra zeros.');
    if (!isNaN(salary) && salary < 0) errors.push("Salary can't be negative.");
    if (!isNaN(other) && other > 10_000_000) errors.push('Other income looks too high — check for extra zeros.');
    if (!isNaN(other) && other < 0) errors.push("Other income can't be negative.");
    return errors;
  }

  window.INVESTOR_SCHEMA = [
    {
      id: 'income',
      title: 'Income',
      description: 'The non-rental income that carries your serviceability.',
      supportKicker: 'Section 1 · Income',
      supportTitle: 'Non-rental income matters most.',
      supportBody: 'Lenders shade rent (usually 80%) but count salary and other stable income in full. This is what carries a bigger portfolio.',
      fields: [
        { key: 'salary', type: 'currency', label: 'Gross annual salary', placeholder: '120000' },
        { key: 'otherIncome', type: 'currency', label: 'Other stable annual income (optional)', placeholder: '0', optional: true },
      ],
      validate: validateIncomeStep,
    },
    {
      id: 'properties',
      title: 'Existing properties',
      description: 'Add each property you own — value, current loan, weekly rent, and type.',
      supportKicker: 'Section 2 · Portfolio',
      supportTitle: 'Leverage is calculated across the portfolio.',
      supportBody: 'Total debt ÷ total value = portfolio LVR. Below 60% is usually the cleanest zone for borrowing more.',
      fields: [],
      onRender: renderPropertyStep,
      validate: validatePropertyStep,
    },
    {
      id: 'funding',
      title: 'Funding position',
      description: 'Cash available for the next move, plus any specific lender preferences.',
      supportKicker: 'Section 3 · Funding',
      supportTitle: 'Cash is still king at the edge.',
      supportBody: 'Even with usable equity, lenders look at a real cash buffer. 10%+ of purchase price is a common threshold.',
      fields: [
        { key: 'availableCash', type: 'currency', label: 'Cash available for next purchase', placeholder: '80000' },
        { key: 'riskAppetite', type: 'choice', label: 'Appetite for more leverage',
          options: ['Conservative', 'Balanced', 'Aggressive growth'] },
        { key: 'crossSec', type: 'choice', label: 'Are any of your loans cross-collateralised?',
          options: ['No', 'Yes — some', "Not sure"] },
      ]
    },
    {
      id: 'target',
      title: 'Next purchase goal',
      description: "What are you sizing the next move at? We test against your equity and capacity.",
      supportKicker: 'Section 4 · Target',
      supportTitle: 'Reality-check the next step.',
      supportBody: "We estimate 20% deposit + usual serviceability multiples at today's assessment rate.",
      fields: [
        { key: 'targetValue', type: 'currency', label: 'Target purchase price (optional if just reviewing)', placeholder: '750000', optional: true },
        { key: 'targetRent', type: 'currency', label: 'Expected weekly rent (if investment)', placeholder: '600', optional: true },
        { key: 'timeframe', type: 'choice', label: 'Target timeframe',
          options: ['0–3 months', '3–6 months', '6–12 months', '12+ months', 'Just reviewing'] },
      ],
      validate: validateTargetStep,
    },
  ];

})();
