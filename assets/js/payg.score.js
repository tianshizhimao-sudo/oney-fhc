/* Oney FHC — PAYG scoring
   Calibration notes:
   - Advisor weights softened (regular 15→12, sometimes 9→6) so "somewhat engaged"
     files no longer falsely push into the Strong band.
   - Change/confidence ranges tightened to better separate medium vs strong.
   - Dimensions are capped to 25 each; total /100. Bands: strong ≥70, moderate ≥45.
*/
(function () {
  function scorePayg(s) {
    // 1. Liability pressure (25)
    const ccMap = { 'None': 25, 'Under $10k': 18, '$10k – $30k': 9, '$30k+': 2 };
    const plMap = { 'None': 25, 'Under $20k': 17, '$20k – $50k': 8, '$50k+': 2 };
    const ccS = ccMap[s.creditCards] ?? 12;
    const plS = plMap[s.personalLoan] ?? 12;
    const hecsDelta = s.hecs === 'Yes' ? -4 : 0;
    const liability = Math.max(0, Math.round((ccS + plS) / 2 + hecsDelta));

    // 2. Financial visibility (25)
    const reviewMap = { 'Past 6 months': 25, '6–12 months ago': 19, '1–2 years ago': 11, '2+ years ago': 5, 'Never': 2 };
    const rateMap = { 'Yes, to the decimal': 8, 'Roughly': 5, 'Not really': 2, 'No loan': 6 };
    const budget = s.hasBudget === 'Yes' ? 5 : 0;
    const visibility = Math.min(25, Math.round((reviewMap[s.lastReview] ?? 6) * 0.55 + (rateMap[s.rateConfidence] ?? 4) + budget));

    // 3. Review discipline (25)
    const discipline = Math.min(25, Math.round((reviewMap[s.lastReview] ?? 6) * 0.78 + budget * 1.3));

    // 4. Support readiness (25)
    const advisorMap = { 'Yes — regularly': 12, 'Sometimes': 6, 'No': 2 };
    const changeMap = { 'None': 7, 'Job change (same industry)': 5, 'Role change (different industry)': 3, 'Income drop': 0 };
    const confMap = { 'Very confident': 5, 'Somewhat confident': 3, 'Uncertain': 1, 'Stuck': 0 };
    const support = Math.min(25, (advisorMap[s.hasAdvisor] ?? 4) + (changeMap[s.recentChange] ?? 4) + (confMap[s.confidence] ?? 2));

    const score = Math.round(liability + visibility + discipline + support);

    const heading = score >= 70 ? 'Your PAYG profile looks lender-ready.'
      : score >= 45 ? 'Solid base — a few tight spots to fix.'
      : "There's real prep work before applying.";

    const summary = score >= 70
      ? 'Low pressure, decent visibility, and a reasonable review rhythm. Focus on locking in the right product rather than fixing fundamentals.'
      : score >= 45
        ? 'You can move in a few months. Start with the single biggest lever in the attention list below — usually credit card limits or a dated rate.'
        : 'Worth stepping back: a 3–6 month cleanup tends to unlock materially more borrowing power than rushing to apply now.';

    const metrics = [
      { label: 'Overall readiness', value: `${score}/100`, tone: score >= 70 ? 'positive' : score >= 45 ? 'warning' : 'danger', bar: score, barTone: score >= 70 ? 'good' : score >= 45 ? 'warn' : 'danger' },
      { label: 'Liability pressure', value: `${Math.round(liability)}/25`, bar: (liability/25)*100, barTone: liability >= 18 ? 'good' : liability >= 10 ? 'warn' : 'danger' },
      { label: 'Financial visibility', value: `${Math.round(visibility)}/25`, bar: (visibility/25)*100, barTone: visibility >= 18 ? 'good' : visibility >= 10 ? 'warn' : 'danger' },
      { label: 'Support readiness', value: `${Math.round(support)}/25`, bar: (support/25)*100, barTone: support >= 18 ? 'good' : support >= 10 ? 'warn' : 'danger' },
    ];

    const attention = [];
    if (s.creditCards === '$30k+' || s.creditCards === '$10k – $30k')
      attention.push({ tone: 'warn', icon: '💳', title: 'Credit limits are reducing your borrowing power', body: 'Lenders assess the limit, not the balance. Dropping unused card limits or closing unused cards can unlock $30k–$100k+ in borrowing capacity.' });
    if (s.personalLoan === '$20k – $50k' || s.personalLoan === '$50k+')
      attention.push({ tone: 'danger', icon: '📉', title: 'Personal / car loan impact', body: 'These monthly commitments cut serviceability hard. Accelerate repayment or refinance before a home loan application if you can.' });
    if (s.lastReview === '2+ years ago' || s.lastReview === 'Never')
      attention.push({ tone: 'warn', icon: '🗓', title: "You haven't reviewed in a while", body: 'Most people sitting on older loans are 0.3–0.8% above market. A review typically pays for itself within months.' });
    if (s.recentChange === 'Income drop')
      attention.push({ tone: 'danger', icon: '⚠️', title: 'Recent income drop', body: 'Lenders prefer stable or rising income. If possible, wait for 1–2 clean payslip cycles before applying.' });
    if (s.confidence === 'Uncertain' || s.confidence === 'Stuck')
      attention.push({ tone: 'warn', icon: '🧭', title: 'Direction is unclear', body: "The gap is usually not the numbers, it's deciding what outcome you're optimising for. A 15-min chat with a broker often clears this in one sitting." });

    const positives = [];
    if (s.creditCards === 'None' && s.personalLoan === 'None')
      positives.push({ tone: 'good', icon: '🧾', title: 'Low liability load', body: "You're giving away very little borrowing power to short-term debt — one of the biggest free wins in serviceability." });
    if (s.lastReview === 'Past 6 months')
      positives.push({ tone: 'good', icon: '🔍', title: 'Strong review rhythm', body: 'Recent reviews mean you are rarely sitting on stale pricing — a meaningful long-term advantage.' });
    if (s.hasAdvisor === 'Yes — regularly')
      positives.push({ tone: 'good', icon: '🤝', title: 'Supported structure', body: 'Having a broker or adviser on speed dial materially lifts outcomes on application timing and product mix.' });
    if (s.employment === 'Full-time PAYG' && s.recentChange === 'None')
      positives.push({ tone: 'good', icon: '💼', title: 'Clean employment window', body: 'Stable full-time PAYG with no recent change is the cleanest shape lenders see.' });

    return {
      score, heading, summary, metrics, attention, positives,
      cta: {
        title: 'Want this looked at properly?',
        body: 'Get a human read on what would shift your borrowing power the most — book a 15-min chat.',
        primary:   { label: 'Book a 15-min chat',       href: 'https://oneyco.com.au/#contact' },
        secondary: { label: 'Get My Free Report',        href: 'next-step.html' },
        tertiary:  { label: 'How this score is built',   href: 'index.html#how-it-works' },
      }
    };
  }
  window.scorePayg = scorePayg;
})();
