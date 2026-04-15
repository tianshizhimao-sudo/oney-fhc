/* Oney FHC — PAYG schema */
(function () {
  window.PAYG_SCHEMA = [
    {
      id: 'setup',
      title: 'Your current setup',
      description: 'Start with the facts that lenders read first.',
      supportKicker: 'Section 1 · Snapshot',
      supportTitle: 'The profile lenders read first.',
      supportBody: 'Employment type, whether you already hold a home loan, and dependents set your starting serviceability picture.',
      fields: [
        { key: 'employment', type: 'choice', label: 'Employment',
          options: ['Full-time PAYG', 'Part-time PAYG', 'Casual', 'Contract PAYG'] },
        { key: 'hasHomeLoan', type: 'choice', label: 'Do you currently have a home loan?', cols: 2,
          options: ['Yes', 'No'] },
        { key: 'dependents', type: 'choice', label: 'Dependents',
          options: ['None', '1', '2', '3+'] },
      ]
    },
    {
      id: 'liabilities',
      title: 'Liability pressure',
      description: 'Short-term commitments weigh heavily in lender calculators. Include unused limits.',
      supportKicker: 'Section 2 · Commitments',
      supportTitle: 'Small debts, big impact.',
      supportBody: 'Credit card and BNPL limits often hurt more than people realise — lenders assess the limit, not the balance.',
      fields: [
        { key: 'creditCards', type: 'choice', label: 'Credit card / BNPL limits',
          options: ['None', 'Under $10k', '$10k – $30k', '$30k+'] },
        { key: 'personalLoan', type: 'choice', label: 'Personal / car loan balance',
          options: ['None', 'Under $20k', '$20k – $50k', '$50k+'] },
        { key: 'hecs', type: 'choice', label: 'HECS / HELP debt', cols: 2,
          options: ['Yes', 'No'] },
      ]
    },
    {
      id: 'review',
      title: 'Review habits',
      description: 'How closely you track finances is a surprisingly strong signal.',
      supportKicker: 'Section 3 · Habits',
      supportTitle: 'Review discipline = readiness.',
      supportBody: 'People who review their rate and spending yearly tend to have cleaner, cheaper lending positions.',
      fields: [
        { key: 'lastReview', type: 'choice', label: 'Last full review of your finances',
          options: ['Past 6 months', '6–12 months ago', '1–2 years ago', '2+ years ago', 'Never'] },
        { key: 'rateConfidence', type: 'choice', label: 'Do you know your current home loan rate?',
          options: ['Yes, to the decimal', 'Roughly', "Not really", 'No loan'] },
        { key: 'hasBudget', type: 'choice', label: 'Do you track monthly spending?', cols: 2,
          options: ['Yes', 'No'] },
      ]
    },
    {
      id: 'support',
      title: 'Confidence & support',
      description: 'Having the right people on your side changes outcomes.',
      supportKicker: 'Section 4 · Support',
      supportTitle: 'Good structure beats good luck.',
      supportBody: 'Advisers, mortgage brokers, and a clean employment window significantly raise readiness.',
      fields: [
        { key: 'hasAdvisor', type: 'choice', label: 'Do you work with a broker or financial adviser?',
          options: ['Yes — regularly', 'Sometimes', 'No'] },
        { key: 'recentChange', type: 'choice', label: 'Any recent income / employment changes?',
          options: ['None', 'Job change (same industry)', 'Role change (different industry)', 'Income drop'] },
        { key: 'confidence', type: 'choice', label: 'How confident are you in your next step?',
          options: ['Very confident', 'Somewhat confident', 'Uncertain', 'Stuck'] },
      ]
    },
  ];
})();
