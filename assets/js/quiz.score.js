/* Oney FHC — Quick Check scoring + route recommendation */
(function () {
  function scoreQuiz(s) {
    const capScore = ({ 'lt-25k': 8, '25-50k': 18, '50-100k': 28, '100-200k': 34, '200k+': 40 })[s.capital] || 0;
    const tlScore = ({ '0-3': 15, '3-6': 13, '6-12': 10, '12+': 7 })[s.timeline] || 0;
    const profileAlign = 20;
    const press = Array.isArray(s.pressure) ? s.pressure : [];
    let penalty = 0;
    if (press.includes('credit-card')) penalty += 7;
    if (press.includes('personal-loan')) penalty += 9;
    if (press.includes('hecs')) penalty += 4;
    if (press.includes('dependents')) penalty += 3;
    if (press.includes('recent-change')) penalty += 5;
    let score = capScore + tlScore + profileAlign + 25 - penalty;
    if (press.includes('none')) score += 10;
    score = Math.max(5, Math.min(100, Math.round(score)));

    let route = { key: 'payg', name: 'PAYG Health Check', href: 'payg.html' };
    if (s.profile === 'business' || s.goal === 'commercial') {
      route = { key: 'business', name: 'Business Health Check', href: 'business.html' };
    } else if (s.profile === 'investor' || s.profile === 'hybrid' || s.goal === 'invest') {
      route = { key: 'investor', name: 'Investor Portfolio Check', href: 'investor.html' };
    }

    const alts = [
      { key: 'payg', name: 'PAYG', href: 'payg.html' },
      { key: 'business', name: 'Business', href: 'business.html' },
      { key: 'investor', name: 'Investor', href: 'investor.html' },
    ].filter(a => a.key !== route.key);

    const goalLabel = ({
      'first-home': 'buying your first home',
      'upgrade': 'upgrading homes',
      'refinance': 'refinancing',
      'invest': 'buying an investment property',
      'commercial': 'business or commercial finance',
      'review': 'reviewing your position',
    })[s.goal] || 'your next move';

    const heading = score >= 70
      ? `You're in reasonable shape for ${goalLabel}.`
      : score >= 45
        ? `Close, but there are gaps to tighten before ${goalLabel}.`
        : `There's meaningful prep work before ${goalLabel} is realistic.`;

    const summary = score >= 70
      ? `Capital and pressure look manageable. The ${route.name} goes deeper on exactly the numbers a lender will stress-test.`
      : score >= 45
        ? `Enough foundation to act in a few months. The ${route.name} identifies the specific levers to pull.`
        : `Use the ${route.name} to see where the biggest wins are before committing to a timeline.`;

    const metrics = [
      { label: 'Readiness preview', value: `${score}/100`, tone: score >= 70 ? 'positive' : score >= 45 ? 'warning' : 'danger', bar: score, barTone: score >= 70 ? 'good' : score >= 45 ? 'warn' : 'danger' },
      { label: 'Capital signal', value: ({ 'lt-25k': 'Light', '25-50k': 'Building', '50-100k': 'Workable', '100-200k': 'Strong', '200k+': 'Excellent' })[s.capital] || '—' },
      { label: 'Pressure load', value: press.length && !press.includes('none') ? `${press.filter(p => p !== 'none').length} item${press.length > 1 ? 's' : ''}` : 'Clear' },
      { label: 'Timing', value: ({ '0-3': '<3 months', '3-6': '3–6 months', '6-12': '6–12 months', '12+': '12+ months' })[s.timeline] || '—' },
    ];

    const routeCard = `
      <div class="route-card fade-up visible">
        <div class="route-kicker">Recommended next step</div>
        <h3>${route.name}</h3>
        <p>Based on your profile and goal, this assessment asks the right follow-up questions to give you a bank-grade readiness picture — not another generic score.</p>
        <a class="btn-purple" href="${route.href}" data-cta-tier="primary" data-route="${route.key}">Continue to ${route.name} →</a>
        <div class="route-alt">
          <span class="route-alt-label">Other tools</span>
          ${alts.map(a => `<a href="${a.href}" data-cta-tier="secondary" data-route="${a.key}">${a.name} Check</a>`).join('')}
        </div>
      </div>`;

    const attention = [];
    if (press.includes('credit-card')) attention.push({ tone: 'warn', icon: '💳', title: 'Credit card / BNPL on file', body: 'Lenders assess limits, not just balances. Closing or lowering unused limits often unlocks meaningful borrowing capacity.' });
    if (press.includes('personal-loan')) attention.push({ tone: 'danger', icon: '📉', title: 'Personal/car loan impact', body: 'These commitments bite hardest into serviceability. Paying down or refinancing before applying is usually worthwhile.' });
    if (s.capital === 'lt-25k' && (s.goal === 'first-home' || s.goal === 'upgrade')) attention.push({ tone: 'warn', icon: '💰', title: 'Capital is tight for this goal', body: 'Under $25k makes LMI and upfront costs a real constraint. Build savings or explore guarantor/FHB schemes.' });
    if (s.timeline === '0-3' && score < 55) attention.push({ tone: 'danger', icon: '⏱', title: 'Short timeline with gaps', body: 'A 3-month window usually needs a cleaner readiness picture than this one. Either extend the window or focus on 2–3 big levers.' });

    const positives = [];
    if (press.includes('none')) positives.push({ tone: 'good', icon: '✅', title: 'No major liabilities', body: 'This is one of the biggest free wins in serviceability calculations.' });
    if (s.capital === '100-200k' || s.capital === '200k+') positives.push({ tone: 'good', icon: '🏦', title: 'Capital position is strong', body: 'You likely clear the 20% deposit threshold on most price bands, which avoids LMI.' });
    if (s.timeline === '12+') positives.push({ tone: 'good', icon: '🗓', title: 'Runway on your side', body: 'With 12+ months you can engineer a noticeably better application.' });

    return {
      score, heading, summary, metrics, routeCard, routeKey: route.key, attention, positives,
      cta: {
        title: 'Want a professional second opinion?',
        body: 'Run the recommended deep-check first — then book a 15-min chat with a human who has spent 8+ years inside the Big 4.',
        primary:   { label: 'Continue to ' + route.name, href: route.href },
        secondary: { label: 'Book a 15-min chat',        href: 'https://oneyco.com.au/#contact' },
        tertiary:  { label: 'How this score is built',   href: 'index.html#how-it-works' },
      }
    };
  }
  window.scoreQuiz = scoreQuiz;
})();
