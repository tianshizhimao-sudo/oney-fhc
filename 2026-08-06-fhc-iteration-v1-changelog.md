# FHC Iteration v1 Changelog — 2026-08-06

## Business Objective
Improve FHC tool conversion rate and usability through targeted bug fixes and content corrections, without structural changes.

## Scope
Safe, high-ROI fixes only. No architecture changes, no new features, no API migrations.

## Detailed Changes

### 1. Fix: localStorage key mismatch on next-step.html (CONVERSION BUG)
- **File**: `next-step.html`
- **What**: Changed `localStorage.getItem('oney-fhc-quiz-v1')` to `localStorage.getItem('oney-fhc-quiz')` to match the key used by the tool engine (`storageKeyFor('quiz')` returns `'oney-fhc-quiz'`).
- **Why**: Quiz scores and grades were NEVER displaying on the post-assessment conversion page. The personalised "Your score: X/100" chip and score-aware email content were always falling back to defaults.
- **Impact**: HIGH — restores score personalization on the conversion page, which is critical for the email capture funnel.

### 2. Fix: about.html content out of sync with current product
- **File**: `about.html`
- **What**: Updated "How It Works" section and FAQ to match the current FHC product:
  - "Answer 7 Questions" → "Take a Quick Check" (5 steps)
  - "Takes about 3 minutes" → "Takes about 1–2 minutes"
  - "4 dimensions: Deposit, Income, Debts, Timeline" → explains Quick Check routing + specialist tool dimensions
  - CTA "Take the 3-Min Quiz → 7 questions" → "Start the Quick Check → 60 seconds"
- **Why**: Stale content creates a trust gap. Users arriving at about.html see information that doesn't match the actual tool experience.
- **Impact**: MEDIUM — improves trust and reduces confusion for users exploring the about/FAQ page.

### 3. Fix: mobile hamburger nav has no close behaviour
- **File**: `assets/js/brand.js`
- **What**: Added two close handlers:
  - Close nav when any nav link is clicked (so the overlay dismisses on navigation)
  - Close nav when clicking outside the nav element (standard mobile pattern)
- **Why**: Users could open the hamburger menu but had no way to dismiss it except tapping the hamburger again. This is a known UX friction pattern on mobile.
- **Impact**: MEDIUM — removes a common mobile UX pain point across all pages using the shared brand shell.

## Security Flags (NOT fixed — requires infrastructure change)

### CRITICAL: Exposed Resend API key in client-side code
- **File**: `next-step.html`, line ~508
- **What**: The Resend API key (`re_daqk4v5i_...`) is hardcoded in frontend JavaScript and used directly via `fetch()` from the browser. Anyone can extract this key from the page source and send emails through the account.
- **Recommendation**: Migrate the email-sending logic to a Supabase Edge Function (same pattern already used in `early-bird.html` for lead capture). Rotate the exposed key immediately.
- **Priority**: HIGH — should be addressed in the next iteration.

## Expected Impact
- Conversion page now correctly shows personalised quiz scores (was completely broken)
- About page builds trust instead of creating confusion
- Mobile navigation works as users expect
- Security risk identified and documented for next action

## Risks
- Changes are all non-structural — no risk to core assessment engine, scoring, or data flow
- The exposed API key is an existing risk, not introduced by this change — flagged for urgent follow-up

## Next Actions
1. **URGENT**: Rotate the exposed Resend API key and move email sending to a Supabase Edge Function
2. Consider linking `next-step.html` from deep-check results (currently orphaned — no tool results page links to it)
3. Uncomment the broker CTA on `next-step.html` when licence is active (currently creates a dead-end after email capture)
4. Align `about.html` styling with the brand shell (currently uses standalone inline CSS instead of brand.css/tool-shell.css)
5. Add the `oney-analytics-domain` meta tag to `about.html` and `next-step.html` so Plausible tracks those pages
