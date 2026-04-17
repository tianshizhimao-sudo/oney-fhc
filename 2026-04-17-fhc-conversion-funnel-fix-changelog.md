# FHC Changelog — 2026-04-17 — Conversion Funnel Fix + UX Repair

## Business Objective
Reconnect the orphaned email capture page (`next-step.html`) to the product funnel, fix a JavaScript crash on the post-submission flow, and increase discoverability of the Rate Impact Calculator — all aimed at capturing warm leads that were previously lost after deep check completion.

## Scope
- 3 score files (payg.score.js, business.score.js, investor.score.js)
- 1 conversion page (next-step.html)
- 5 navigation updates (index.html, quiz.html, payg.html, business.html, investor.html)
- 1 new tool card on index.html

## Detailed Changes

### 1. Wire `next-step.html` into deep check CTAs
**Files:** `assets/js/payg.score.js`, `assets/js/business.score.js`, `assets/js/investor.score.js`

All three deep check result pages now include a "Get My Free Report" secondary CTA linking to `next-step.html`. Previously, `next-step.html` had zero inbound links from any page — the entire email capture funnel was dead.

- **PAYG:** Secondary CTA changed from "Try the Business Check" → "Get My Free Report"
- **Business:** Secondary CTA changed from "Open Commercial Intake" → "Get My Free Report"
- **Investor:** Secondary CTA changed from "Try the PAYG Check" → "Get My Free Report"

### 2. Fix broken post-submission UX in `next-step.html`
**File:** `next-step.html`

- **Bug fix:** Removed `document.querySelector('.broker-card').scrollIntoView(...)` which threw a `TypeError` because `.broker-card` is inside an HTML comment (hidden pending broker licence). This crash occurred immediately after the most important conversion event (email submission).
- **Copy fix:** Replaced thank-you message that referenced the hidden broker CTA ("scroll down to see how a free 15-minute chat...") with useful next actions — a link to the Rate Impact Calculator and a link back to all tools.

### 3. Add Rate Impact Calculator to site navigation
**Files:** `index.html`, `quiz.html`, `payg.html`, `business.html`, `investor.html`

- Added "Rate Calc" link to the main navigation bar across all 5 tool pages.
- Added a Rate Impact Calculator tool card to the index.html "Pick your path" grid, making it discoverable alongside the core assessment tools.

## Expected Impact
- **Email capture conversion:** From 0% (page unreachable) to measurable — every deep check completer now sees the "Get My Free Report" CTA.
- **Post-submit UX:** No more JavaScript crash after email submission. Users see actionable next steps instead of a broken reference.
- **Rate Calc engagement:** Previously hidden tool now accessible from every page via nav + featured on homepage.

## Risks
- **API key exposure:** The Resend API key remains hardcoded client-side in `next-step.html:511`. This is a pre-existing security issue — not introduced by this change — but should be moved to a backend function (Supabase edge function) in a future iteration.
- **No regression risk:** Changes are additive (new links, updated copy) with no structural or architectural modifications.

## Next Actions
1. **Move Resend API key to backend** — Create a Supabase edge function to proxy email sending.
2. **Uncomment broker CTA** — When broker licence is active, re-enable the Layer 3 broker booking section in `next-step.html` and update step count.
3. **Add funnel analytics** — Track conversion rate from deep check result → next-step.html → email submitted.
4. **Add `prefers-reduced-motion` media query** — Disable pulsing animations in `early-bird.html` for accessibility.
