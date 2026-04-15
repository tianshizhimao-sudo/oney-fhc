/* Oney FHC — Business schema */
(function () {
  window.BUSINESS_SCHEMA = [
    {
      id: 'profile',
      title: 'Your business profile',
      description: 'The basics — what the bank sees on page one of an application.',
      supportKicker: 'Section 1 · Profile',
      supportTitle: 'Stability is half the story.',
      supportBody: 'Years trading, structure, and team size are the backbone of how bankers pre-judge your file before numbers show up.',
      fields: [
        { key: 'yearsTrading', type: 'choice', label: 'Years trading',
          options: ['<1 year', '1–2 years', '2–5 years', '5–10 years', '10+ years'] },
        { key: 'entity', type: 'choice', label: 'Business structure',
          options: ['Sole trader', 'Partnership', 'Company (Pty Ltd)', 'Trust'] },
        { key: 'employees', type: 'choice', label: 'Team size',
          options: ['Just me', '2–5', '6–15', '16+'] },
        { key: 'revenueBand', type: 'choice', label: 'Annual revenue (approx.)',
          options: ['<$200k', '$200k–$500k', '$500k–$1M', '$1M–$3M', '$3M+'] },
      ]
    },
    {
      id: 'ops',
      title: 'Financial operations',
      description: 'How clean is your finance engine? Cleaner = faster and cheaper lending.',
      supportKicker: 'Section 2 · Operations',
      supportTitle: 'Clean books = real leverage.',
      supportBody: 'Up-to-date accounts, a separate business bank account, and understood cashflow unlock better pricing and faster decisions.',
      fields: [
        { key: 'bookkeeping', type: 'choice', label: 'How up-to-date are your accounts?',
          options: ['Current (last 30 days)', 'Last quarter', 'Last year', 'Behind / catching up'] },
        { key: 'separated', type: 'choice', label: 'Business + personal finances separated?', cols: 2,
          options: ['Yes', 'Mostly', 'No'] },
        { key: 'cashflow', type: 'choice', label: 'Cashflow position right now',
          options: ['Strong and stable', 'OK, with tight months', 'Lumpy', 'Stressed'] },
        { key: 'taxUpToDate', type: 'choice', label: 'ATO obligations (BAS / tax) up to date?', cols: 2,
          options: ['Yes', 'No'] },
      ]
    },
    {
      id: 'lending',
      title: 'Lending & advisory setup',
      description: 'The structure around the numbers matters as much as the numbers.',
      supportKicker: 'Section 3 · Structure',
      supportTitle: 'Relationship + advisers.',
      supportBody: 'Business bankers reward clarity: an accountant who knows your file, a banker who knows your business, and clean existing facilities.',
      fields: [
        { key: 'hasAccountant', type: 'choice', label: 'Do you have a current accountant?', cols: 2,
          options: ['Yes', 'No'] },
        { key: 'hasBanker', type: 'choice', label: 'Relationship with your business banker',
          options: ['Strong — named banker', 'Transactional', 'No relationship'] },
        { key: 'existingLoan', type: 'choice', label: 'Existing business lending',
          options: ['None', 'Overdraft / small facility', 'Equipment / term loan', 'Multiple facilities'] },
        { key: 'loanPurpose', type: 'choice', label: 'If you were to apply now, what for?',
          options: ['Working capital', 'Equipment', 'Property / commercial purchase', 'Refinance existing', 'Not applying'] },
      ]
    },
    {
      id: 'change',
      title: 'Recent change',
      description: 'Business bankers watch for changes that affect risk — we account for them.',
      supportKicker: 'Section 4 · Change',
      supportTitle: 'Change is scrutinised.',
      supportBody: 'Revenue jumps, ownership changes, and industry events can be tailwinds or friction — bankers will ask, so knowing matters.',
      fields: [
        { key: 'recentChange', type: 'multi', label: 'Tick anything that applies',
          options: [
            'Revenue up 20%+ in 12 months',
            'Revenue down 20%+ in 12 months',
            'Ownership / partner change',
            'New major customer / contract',
            'Lost a major customer',
            'Major industry shift',
            'None of these',
          ] },
        { key: 'runway', type: 'choice', label: 'Runway if revenue paused tomorrow',
          options: ['<1 month', '1–3 months', '3–6 months', '6+ months'] },
      ]
    },
  ];
})();
