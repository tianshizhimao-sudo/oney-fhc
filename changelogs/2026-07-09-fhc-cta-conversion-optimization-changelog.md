# 2026-07-09 — FHC CTA & Conversion Optimization

## Business Objective
Improve conversion rate from assessment completion to booking a consultation call by:
1. Eliminating dead-end UI elements that lack actionable paths
2. Adding secondary conversion touchpoints below results
3. Personalizing CTA copy to match the user's emotional state at each score band

## Scope
- quiz.html — CTA band buttons
- payg.html, business.html, investor.html — pre-footer CTA bands
- payg.score.js, business.score.js, investor.score.js — score-aware CTA copy

## Detailed Changes

### 1. Quiz CTA Band — Added Action Buttons
**File:** `quiz.html`
**Before:** The pre-footer CTA band had text ("Not sure which tool is right?") but zero clickable elements. Users who scrolled past the form hit a dead end.
**After:** Added two buttons:
- Primary: "Start the Quick Check" — scrolls back to the form
- Secondary: "Browse all tools" — links to the hub page
Both buttons include `data-analytics` attributes for Plausible event tracking.

### 2. Deep-Check Pages — Added Pre-Footer CTA Bands
**Files:** `payg.html`, `business.html`, `investor.html`
**Before:** After the assessment section, users saw only the bare footer — no secondary conversion prompt.
**After:** Each page now has a pre-footer CTA band (matching the index.html design pattern) with:
- Tool-specific headline and supporting copy
- Primary button: "Book a 15-min chat" (links to oneyco.com.au/#contact)
- Secondary button: "Take the Quick Check" (for users who landed directly)
- Analytics attributes on all links

### 3. Score-Aware CTA Copy in Results
**Files:** `assets/js/payg.score.js`, `assets/js/business.score.js`, `assets/js/investor.score.js`
**Before:** The result CTA block used static copy regardless of score ("Want this looked at properly?").
**After:** CTA title and body now adapt to the score band:
- **Strong (>=70):** Momentum-focused — "Ready to move? Let's talk strategy." / "Your file looks clean — pick the right product."
- **Moderate (45-69):** Gap-closing — "Close — a quick chat could close the gap." / "One lever often worth tens of thousands."
- **Weak (<45):** Reassurance + urgency — "This score is fixable." / "Most improve 20+ points in 2–3 months."

## Expected Impact
- **Quiz page:** Reduced bounce at bottom of page; clear re-engagement path
- **Deep-check pages:** Second conversion touchpoint catches users who scroll past the in-result CTA
- **Score-aware copy:** Better emotional resonance → higher click-through on "Book a chat" CTA
- Estimated lift: 5-15% improvement in quiz-to-booking funnel conversion

## Risks
- **Low:** All changes are additive HTML and copy modifications; no logic, schema, or engine changes
- **Security flag (pre-existing, not changed):** `next-step.html` line 507 contains a hardcoded Resend API key (`re_daqk4v5i_...`) exposed in client-side JavaScript. This should be moved to a server-side proxy in a future iteration.

## Next Actions
1. Monitor Plausible analytics for new events (`quiz_cta_band_scroll`, `*_cta_band_book`, etc.)
2. Address the exposed Resend API key in next-step.html (requires server-side proxy — Supabase Edge Function recommended)
3. Consider A/B testing the score-aware CTA copy against the original static version
4. Evaluate adding a "Share results" / "Email my report" feature to increase viral distribution
