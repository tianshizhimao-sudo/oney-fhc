/* Oney FHC — Business scoring
   Calibration notes:
   - Cashflow weight raised slightly ("Stressed" → 0 so it no longer contributes).
   - 2–5y trading got a small boost (+1) so mid-stage businesses don't score
     identically to sub-1y ventures.
   - Multiple facilities kept at 5 to reward established lending history without
     rewarding over-leveraging.
*/
(function () {
  function scoreBusiness(s) {
    // 1. Business visibility (25)
    const bookMap = { 'Current (last 30 days)': 14, 'Last quarter': 10, 'Last year': 5, 'Behind / catching up': 1 };
    const sepMap = { 'Yes': 7, 'Mostly': 4, 'No': 0 };
    const atoMap = { 'Yes': 4, 'No': 0 };
    const visibility = Math.min(25, (bookMap[s.bookkeeping] ?? 5) + (sepMap[s.separated] ?? 3) + (atoMap[s.taxUpToDate] ?? 1));

    // 2. Cashflow control (25)
    const cfMap = { 'Strong and stable': 18, 'OK, with tight months': 12, 'Lumpy': 6, 'Stressed': 0 };
    const runwayMap = { '<1 month': 1, '1–3 months': 4, '3–6 months': 6, '6+ months': 7 };
    const cashflow = Math.min(25, (cfMap[s.cashflow] ?? 8) + (runwayMap[s.runway] ?? 3));

    // 3. Adviser / banker structure (25)
    const acctMap = { 'Yes': 10, 'No': 2 };
    const bankerMap = { 'Strong — named banker': 10, 'Transactional': 5, 'No relationship': 1 };
    const loanMap = { 'None': 4, 'Overdraft / small facility': 4, 'Equipment / term loan': 5, 'Multiple facilities': 5 };
    const structure = Math.min(25, (acctMap[s.hasAccountant] ?? 4) + (bankerMap[s.hasBanker] ?? 4) + (loanMap[s.existingLoan] ?? 3));

    // 4. Change readiness (25) — baseline 18, adjusted by events + tenure
    const changes = Array.isArray(s.recentChange) ? s.recentChange : [];
    let change = 18;
    if (changes.includes('Revenue down 20%+ in 12 months')) change -= 9;
    if (changes.includes('Lost a major customer')) change -= 7;
    if (changes.includes('Ownership / partner change')) change -= 4;
    if (changes.includes('Major industry shift')) change -= 3;
    if (changes.includes('Revenue up 20%+ in 12 months')) change += 4;
    if (changes.includes('New major customer / contract')) change += 3;
    if (changes.includes('None of these')) change += 5;
    const years = s.yearsTrading;
    if (years === '<1 year') change -= 6;
    else if (years === '1–2 years') change -= 2;
    else if (years === '2–5 years') change += 1;
    else if (years === '5–10 years') change += 2;
    else if (years === '10+ years') change += 4;
    const changeScore = Math.max(0, Math.min(25, change));

    const score = Math.round(visibility + cashflow + structure + changeScore);

    const heading = score >= 70 ? 'Your business file looks lender-ready.'
      : score >= 45 ? 'Solid base — structure or visibility gaps to close.'
      : 'Real prep work before a lender conversation.';

    const summary = score >= 70
      ? 'Books, cashflow, and support structure all read well. Focus on choosing the right lender for the specific purpose, not fixing fundamentals.'
      : score >= 45
        ? 'You can be application-ready in a month or two. Prioritise the single biggest item below — usually bookkeeping currency or a banker relationship.'
        : 'Step back: 2–3 months of structural fixes (accounts, separation, ATO) usually unlocks dramatically better terms.';

    const metrics = [
      { label: 'Overall readiness', value: `${score}/100`, tone: score >= 70 ? 'positive' : score >= 45 ? 'warning' : 'danger', bar: score, barTone: score >= 70 ? 'good' : score >= 45 ? 'warn' : 'danger' },
      { label: 'Business visibility', value: `${Math.round(visibility)}/25`, bar: (visibility/25)*100, barTone: visibility >= 18 ? 'good' : visibility >= 10 ? 'warn' : 'danger' },
      { label: 'Cashflow control', value: `${Math.round(cashflow)}/25`, bar: (cashflow/25)*100, barTone: cashflow >= 18 ? 'good' : cashflow >= 10 ? 'warn' : 'danger' },
      { label: 'Structure & advisers', value: `${Math.round(structure)}/25`, bar: (structure/25)*100, barTone: structure >= 18 ? 'good' : structure >= 10 ? 'warn' : 'danger' },
    ];

    const attention = [];
    if (s.bookkeeping === 'Behind / catching up' || s.bookkeeping === 'Last year')
      attention.push({ tone: 'danger', icon: '📚', title: 'Accounts are behind', body: "This is the single biggest blocker for business lending. Getting to current (last 30–90 days) usually shifts terms more than anything else you could do." });
    if (s.separated === 'No')
      attention.push({ tone: 'warn', icon: '🔀', title: 'Personal and business money mixed', body: 'Separation is not optional for commercial lenders. A clean business account makes bank statement analysis fair to you.' });
    if (s.taxUpToDate === 'No')
      attention.push({ tone: 'danger', icon: '🏛', title: 'ATO is behind', body: 'Outstanding ATO obligations are one of the fastest decline signals. Address before any application.' });
    if (s.cashflow === 'Stressed' || s.runway === '<1 month')
      attention.push({ tone: 'danger', icon: '💧', title: 'Thin runway', body: 'Lenders want to see the business can absorb a bad month. Building 2–3 months of buffer changes the conversation meaningfully.' });
    if (s.hasAccountant === 'No')
      attention.push({ tone: 'warn', icon: '🧮', title: 'No accountant on file', body: 'An accountant who can produce interim management accounts dramatically speeds approvals. This is often overlooked.' });
    if (s.hasBanker === 'No relationship')
      attention.push({ tone: 'warn', icon: '🏦', title: 'No banker relationship', body: "Relationships de-risk your file in the banker's eyes — it's the cheapest credit uplift available." });
    if (changes.includes('Revenue down 20%+ in 12 months'))
      attention.push({ tone: 'danger', icon: '📉', title: 'Revenue decline in the window', body: 'Lenders will ask. Prepare a clear explanation and, if possible, one clean recovery quarter before applying.' });

    const positives = [];
    if (s.bookkeeping === 'Current (last 30 days)')
      positives.push({ tone: 'good', icon: '📊', title: 'Accounts are current', body: 'A huge advantage — your file will be looked at on the numbers, not queried on timeliness.' });
    if (s.hasBanker === 'Strong — named banker')
      positives.push({ tone: 'good', icon: '🤝', title: 'Strong banker relationship', body: 'Named banker relationships routinely unlock better pricing and faster turnarounds.' });
    if (changes.includes('Revenue up 20%+ in 12 months') || changes.includes('New major customer / contract'))
      positives.push({ tone: 'good', icon: '📈', title: 'Positive trajectory', body: 'Growth signals are tailwind. Present them clearly in any credit memo or application.' });
    if (s.taxUpToDate === 'Yes' && s.separated === 'Yes')
      positives.push({ tone: 'good', icon: '✅', title: 'Clean compliance footprint', body: 'ATO current and funds separated — the two low-cost signals bankers weight heavily.' });

    return {
      score, heading, summary, metrics, attention, positives,
      cta: {
        title: 'Get a banker-grade read on your file',
        body: 'The Business Health Check is a free starting point. Book a 15-min call for a tailored readiness plan.',
        primary:   { label: 'Book a 15-min chat',       href: 'https://oneyco.com.au/#contact' },
        secondary: { label: 'Get My Free Report',        href: 'next-step.html' },
        tertiary:  { label: 'How this score is built',   href: 'index.html#how-it-works' },
      }
    };
  }
  window.scoreBusiness = scoreBusiness;
})();
