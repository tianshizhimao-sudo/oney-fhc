# Changelog — 2026-07-02 — FHC Conversion Funnel Fix

## Business Objective
Wire the email capture funnel (next-step.html) into the main assessment flow, fix dead CTA zones, and resolve a runtime bug — collectively addressing the biggest conversion leak in the FHC tool suite.

## Scope
- PAYG, Business, and Investor score files (CTA block)
- quiz.html (bottom CTA band)
- next-step.html (thank-you state)

## Detailed Changes

### 1. Deep-check results now route to email capture (HIGH IMPACT)
**Files:** `assets/js/payg.score.js`, `assets/js/business.score.js`, `assets/js/investor.score.js`

Previously, all three deep-check tools directed completed users to the external booking link (`oneyco.com.au/#contact`) as the primary CTA. The email capture page (`next-step.html`) existed but was unreachable from the main flow.

**Change:** "Get My Free Report" (→ next-step.html) is now the primary CTA. "Book a 15-min chat" / "Book a strategy chat" moves to secondary. This prioritises the lower-friction email capture before asking for a booking commitment.

### 2. quiz.html bottom CTA band made actionable (MEDIUM IMPACT)
**File:** `quiz.html`

The CTA band at the bottom of the quiz page had text ("Not sure which tool is right?") but no button. Users who scrolled past the quiz had no way to act.

**Change:** Added two buttons: "Start answering above ↑" (smooth-scrolls to quiz) and "Browse all tools" (links to index.html#tools). Both wired with analytics events.

### 3. next-step.html thank-you state bug fix + post-submit CTA (MEDIUM IMPACT)
**File:** `next-step.html`

After email submission, JavaScript tried to scroll to `.broker-card` which is commented out (broker licence not yet active), causing a runtime error and breaking the post-submit flow.

**Changes:**
- Added null-check before scroll attempt — no more runtime error
- Updated thank-you copy from "scroll down to see broker CTA" (which didn't exist) to "Want to go deeper? Try one of our specialist tools"
- Added two post-submit action buttons: "Explore all tools →" and "Book a 15-min chat"

## Expected Impact
- **Email capture rate:** Significant increase — every deep-check completion now offers email capture as the primary next action (previously unreachable)
- **Quiz engagement:** Marginal increase from bottom CTA band activation
- **Post-submit experience:** No more dead-end after email capture; users have clear next actions

## Risks
- **API key exposure (EXISTING, NOT CHANGED):** The Resend API key in next-step.html is still hardcoded in client-side JS. Recommend migrating to a Supabase Edge Function proxy in the next iteration.
- **next-step.html visual consistency (EXISTING, NOT CHANGED):** This page uses standalone inline CSS rather than the shared brand shell. Low risk but worth aligning in a future pass.

## Next Actions
1. **Move Resend API key server-side** — create a Supabase Edge Function to proxy email sends
2. **Align next-step.html to brand shell** — migrate to shared brand.css/tool-shell.css
3. **Add score passthrough to next-step.html** — deep-check results should pass the score via URL params so the email capture page can display it
4. **Track email capture conversion rate** — add Plausible events on next-step.html form submission
