/* Oney FHC — Quick Check schema */
(function () {
  window.QUIZ_SCHEMA = [
    {
      id: 'goal',
      title: 'What are you looking at next?',
      description: 'Pick the closest fit — this decides which assessment gives you the most useful picture.',
      supportKicker: 'Step 1 · Goal',
      supportTitle: 'Start with the goal.',
      supportBody: 'Different goals need different finance lenses. First home ≠ refinance ≠ commercial deal.',
      fields: [{
        key: 'goal', type: 'choice', label: 'Primary goal',
        options: [
          { value: 'first-home', label: 'Buy my first home' },
          { value: 'upgrade', label: 'Upgrade or move home' },
          { value: 'refinance', label: 'Refinance current loan' },
          { value: 'invest', label: 'Buy an investment property' },
          { value: 'commercial', label: 'Business / commercial finance' },
          { value: 'review', label: 'Just reviewing my position' },
        ]
      }]
    },
    {
      id: 'profile',
      title: 'Which best describes your income?',
      description: 'This is what decides whether PAYG, Business, or Investor is the right deep-check.',
      supportKicker: 'Step 2 · Profile',
      supportTitle: 'Profile → tool match.',
      supportBody: 'Salaried (PAYG) people are assessed very differently to self-employed owners or landlords with multiple properties.',
      fields: [{
        key: 'profile', type: 'choice', label: 'My income mainly comes from',
        options: [
          { value: 'payg', label: 'A salary / wage (PAYG)' },
          { value: 'mixed-payg', label: 'Salary + some side income' },
          { value: 'business', label: 'A business I own / am a director of' },
          { value: 'investor', label: 'Rental properties I already own' },
          { value: 'hybrid', label: 'Salary + existing investment property' },
        ]
      }]
    },
    {
      id: 'timeline',
      title: 'When do you want to act?',
      description: 'No pressure — this just calibrates how sharp the readiness signal needs to be.',
      supportKicker: 'Step 3 · Timing',
      supportTitle: 'Timing shapes urgency.',
      supportBody: 'A 3-month window needs sharper preparation than a 12-month window.',
      fields: [{
        key: 'timeline', type: 'choice', label: 'Target timeframe',
        options: [
          { value: '0-3', label: 'Within 3 months' },
          { value: '3-6', label: '3–6 months' },
          { value: '6-12', label: '6–12 months' },
          { value: '12+', label: '12+ months / exploring' },
        ]
      }]
    },
    {
      id: 'deposit',
      title: 'What deposit or capital do you have?',
      description: 'Cash savings + usable equity + any gift or first-home grant you can rely on.',
      supportKicker: 'Step 4 · Capital',
      supportTitle: 'Cash vs equity.',
      supportBody: 'Include genuine savings, equity you can realistically release, and any gifted or grant funds.',
      fields: [{
        key: 'capital', type: 'choice', label: 'Total capital available',
        options: [
          { value: 'lt-25k', label: 'Under $25k' },
          { value: '25-50k', label: '$25k – $50k' },
          { value: '50-100k', label: '$50k – $100k' },
          { value: '100-200k', label: '$100k – $200k' },
          { value: '200k+', label: '$200k+' },
        ]
      }]
    },
    {
      id: 'pressure',
      title: 'Any pressure on your current finances?',
      description: 'Select anything that applies — we factor each into the preview.',
      supportKicker: 'Step 5 · Pressure',
      supportTitle: 'Liabilities matter more than people think.',
      supportBody: 'Credit cards, BNPL, personal loans, and HECS all reduce the headline number lenders calculate for you.',
      fields: [{
        key: 'pressure', type: 'multi', label: 'Tick what applies',
        options: [
          { value: 'credit-card', label: 'Credit card / BNPL balances' },
          { value: 'personal-loan', label: 'Personal or car loan' },
          { value: 'hecs', label: 'HECS / HELP debt' },
          { value: 'dependents', label: 'Dependents' },
          { value: 'recent-change', label: 'Recent income change' },
          { value: 'none', label: 'None of these' },
        ]
      }]
    },
  ];
})();
