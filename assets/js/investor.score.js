/* Oney FHC — Investor scoring
   Calibration notes:
   - Empty rent on investment properties now treated as 0 (was implicitly undefined).
   - Cashflow tiers tightened: -5k → 55, -15k → 35, below → 15 (was shallower).
   - buyScore for "no target set" = 60 (neutral) so pure snapshots sit in the
     moderate band rather than penalising users who skip the target.
   - LVR 0% (debt-free PPOR) treated as 90 rather than 100 — debt-free is strong
     but not "perfect" when considering investor expansion.
*/
(function () {
  function scoreInvestor(s) {
    const salary = parseFloat(s.salary) || 0;
    const otherIncome = parseFloat(s.otherIncome) || 0;
    const targetValue = parseFloat(s.targetValue) || 0;
    const availableCash = parseFloat(s.availableCash) || 0;

    const props = Array.isArray(s.properties) ? s.properties : [];
    let totalValue = 0, totalDebt = 0, totalRent = 0;
    props.forEach(p => {
      const v = parseFloat(p.value) || 0;
      const l = parseFloat(p.loan) || 0;
      const r = parseFloat(p.rent) || 0;
      totalValue += v;
      totalDebt += l;
      if (p.type !== 'ppor') totalRent += r * 52;
    });

    const totalEquity = totalValue - totalDebt;
    const portfolioLVR = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0;
    const maxDebtAt80 = totalValue * 0.8;
    const usableEquity = Math.max(0, maxDebtAt80 - totalDebt);
    const netRentalForService = totalRent * 0.8;
    const interestCosts = totalDebt * 0.065;
    const cashflow = totalRent - interestCosts;
    const totalIncomeForService = salary + otherIncome + netRentalForService;
    const maxBorrow = totalIncomeForService * 5;
    const depositNeeded = targetValue * 0.2;
    const totalAvailable = availableCash + usableEquity;
    const canBuy = targetValue <= 0 ? null : (totalAvailable >= depositNeeded && maxBorrow >= targetValue * 0.8);

    // LVR sub-score
    let lvrScore;
    if (totalValue === 0) lvrScore = 50;
    else if (portfolioLVR === 0) lvrScore = 90;       // debt-free is strong, not perfect for expansion
    else if (portfolioLVR <= 50) lvrScore = 100;
    else if (portfolioLVR <= 60) lvrScore = 85;
    else if (portfolioLVR <= 70) lvrScore = 70;
    else if (portfolioLVR <= 80) lvrScore = 50;
    else lvrScore = Math.max(0, 100 - portfolioLVR);

    // Cashflow sub-score
    let cashflowScore;
    if (totalRent === 0) cashflowScore = 60;          // neutral when no rental income (PPOR-only)
    else if (cashflow >= 5000) cashflowScore = 90;
    else if (cashflow >= 0) cashflowScore = 75;
    else if (cashflow >= -5000) cashflowScore = 55;
    else if (cashflow >= -15000) cashflowScore = 35;
    else cashflowScore = 15;

    // Equity sub-score
    let equityScore;
    if (usableEquity > 200000) equityScore = 100;
    else if (usableEquity > 100000) equityScore = 75;
    else if (usableEquity > 25000) equityScore = 55;
    else if (usableEquity > 0) equityScore = 35;
    else equityScore = 20;

    // Buy readiness
    let buyScore;
    if (canBuy === null) buyScore = 60;
    else if (canBuy) buyScore = 100;
    else buyScore = 30;

    const score = Math.round(lvrScore * 0.35 + cashflowScore * 0.25 + equityScore * 0.25 + buyScore * 0.15);

    const fmtMoney = n => '$' + Math.round(n).toLocaleString();
    const heading = score >= 70 ? 'Your portfolio has room to expand.'
      : score >= 45 ? 'Workable portfolio — tighten leverage or cash first.'
      : 'Prioritise consolidation before the next purchase.';

    const summary = score >= 70
      ? `LVR at ${portfolioLVR.toFixed(1)}% and ${fmtMoney(usableEquity)} in usable equity. Next step is picking the right lender strategy for the target deal.`
      : score >= 45
        ? `Leverage and cashflow are manageable but not comfortable. The attention items below are the fastest way to unlock capacity.`
        : 'Debt-to-value or cashflow is stretched. Fixing one or two items often brings the next purchase back into reach.';

    const metrics = [
      { label: 'Portfolio readiness', value: `${score}/100`, tone: score >= 70 ? 'positive' : score >= 45 ? 'warning' : 'danger', bar: score, barTone: score >= 70 ? 'good' : score >= 45 ? 'warn' : 'danger' },
      { label: 'Total value', value: fmtMoney(totalValue) },
      { label: 'Total debt', value: fmtMoney(totalDebt) },
      { label: 'Total equity', value: fmtMoney(totalEquity), tone: totalEquity > 0 ? 'positive' : '' },
      { label: 'Portfolio LVR', value: `${portfolioLVR.toFixed(1)}%`, bar: Math.min(100, portfolioLVR), barTone: portfolioLVR < 60 ? 'good' : portfolioLVR < 80 ? 'warn' : 'danger' },
      { label: 'Usable equity @ 80% LVR', value: fmtMoney(usableEquity), tone: usableEquity > 100000 ? 'positive' : usableEquity > 0 ? 'warning' : 'danger' },
      { label: 'Net portfolio cashflow', value: (cashflow >= 0 ? '+' : '') + fmtMoney(cashflow) + '/yr', tone: cashflow >= 0 ? 'positive' : 'warning' },
      { label: 'Est. borrowing power', value: fmtMoney(maxBorrow), sub: '5× gross income (rough)' },
    ];

    const attention = [];
    if (portfolioLVR >= 80) attention.push({ tone: 'danger', icon: '🏠', title: 'High LVR limits options', body: `Portfolio LVR of ${portfolioLVR.toFixed(1)}% cuts most investor-lender pricing tiers. Debt reduction or revaluation is the fastest fix.` });
    else if (portfolioLVR >= 65) attention.push({ tone: 'warn', icon: '🏠', title: 'LVR above comfort zone', body: `At ${portfolioLVR.toFixed(1)}% you're workable but paying for it. Below 60% opens up noticeably better product and price options.` });
    if (cashflow < -15000) attention.push({ tone: 'danger', icon: '💧', title: 'Significant negative cashflow', body: `$${Math.round(cashflow).toLocaleString()}/yr is meaningful. Review rents, refinancing, or whether one asset is dragging the rest down.` });
    else if (cashflow < 0) attention.push({ tone: 'warn', icon: '💧', title: 'Portfolio is negatively geared', body: 'Acceptable if income covers it, but it reduces new-borrowing headroom at the margin.' });
    if (usableEquity === 0 && totalValue > 0) attention.push({ tone: 'danger', icon: '🔓', title: 'No usable equity at 80% LVR', body: 'Next purchase will likely need fresh savings or waiting for value growth. Revaluation sometimes surfaces hidden equity.' });
    if (targetValue > 0 && canBuy === false) attention.push({ tone: 'warn', icon: '🎯', title: 'Target price outside current reach', body: `Needs ${fmtMoney(depositNeeded)} deposit; you have ${fmtMoney(totalAvailable)} available between cash and usable equity. Either scale the target or close the gap.` });
    if (s.crossSec === 'Yes — some') attention.push({ tone: 'warn', icon: '🔗', title: 'Cross-collateralised loans on file', body: 'Cross-securitisation restricts flexibility when refinancing or selling. Worth reviewing with a broker.' });

    const positives = [];
    if (portfolioLVR > 0 && portfolioLVR <= 60) positives.push({ tone: 'good', icon: '🏠', title: 'Healthy leverage', body: `LVR of ${portfolioLVR.toFixed(1)}% sits in the prime band for investor pricing.` });
    if (cashflow >= 0 && totalRent > 0) positives.push({ tone: 'good', icon: '💰', title: 'Positive portfolio cashflow', body: 'Rare and powerful. Keeps you clear of lender-imposed income hurdles on expansion.' });
    if (usableEquity > 100000) positives.push({ tone: 'good', icon: '🔓', title: 'Strong usable equity', body: `${fmtMoney(usableEquity)} available for the next deposit — a real tailwind.` });
    if (targetValue > 0 && canBuy === true) positives.push({ tone: 'good', icon: '🎯', title: 'Target looks achievable', body: `Current position supports a ${fmtMoney(targetValue)} purchase on estimate.` });

    return {
      score, heading, summary, metrics, attention, positives,
      cta: {
        title: 'Expand with a strategy, not guesswork',
        body: 'Investor lending is where structure compounds. Book a 15-min chat to map out the cleanest sequence for your next move.',
        primary:   { label: 'Book a strategy chat',     href: 'https://oneyco.com.au/#contact' },
        secondary: { label: 'Get My Free Report',        href: 'next-step.html' },
        tertiary:  { label: 'How this score is built',   href: 'index.html#how-it-works' },
      }
    };
  }
  window.scoreInvestor = scoreInvestor;
})();
