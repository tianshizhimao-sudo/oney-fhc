# FHC Changelog — 2026-07-16

## Business Objective
Improve FHC conversion funnel by fixing broken email capture flow and connecting deep-check result pages to the lead capture page (next-step.html).

## Scope
- Bug fix: next-step.html post-submission JS error
- Conversion: Connect PAYG/Business/Investor results to email capture
- UX: Strengthen quiz.html CTA band with action buttons

## Detailed Changes

### 1. Fix: Broken scrollIntoView on next-step.html (Bug — High Priority)
**File:** `next-step.html` line 550-552  
**Problem:** After email form submission, the code calls `document.querySelector('.broker-card').scrollIntoView()` but the broker-card element is commented out (hidden until broker licence is active). This causes a TypeError on every successful email submission.  
**Fix:** Added null check — `const brokerCard = document.querySelector('.broker-card'); if (brokerCard) { ... }`.  
**Impact:** Prevents JS error for all users who submit the email form.

### 2. Conversion: Route deep-check results to email capture (High Impact)
**Files:** `assets/js/payg.score.js`, `assets/js/business.score.js`, `assets/js/investor.score.js`  
**Problem:** All three deep-check result CTAs linked only to external `oneyco.com.au/#contact` as primary action. The email capture page (`next-step.html`) was completely unreachable from the main user flow — an orphaned conversion page.  
**Fix:** Made "Get My Free Report" (→ next-step.html) the primary CTA. Moved "Book a 15-min chat" to secondary. This captures high-intent users who just completed a full assessment.  
**Impact:** Opens the email capture funnel for all deep-check completions. Expected lift in lead capture rate.

### 3. UX: Quiz CTA band action buttons
**File:** `quiz.html` line 77-82  
**Problem:** CTA band at bottom of quiz page said "Finish the Quick Check first" with no actionable button — users who scrolled past the form had no way to re-engage.  
**Fix:** Added "Start the Quick Check →" (scrolls to form) and "Browse all tools" (→ index.html#tools) buttons.  
**Impact:** Re-engages users who scroll past the assessment form without starting.

## Expected Impact
- **Lead capture**: Previously zero deep-check completions reached email capture. Now all three tools route there as primary CTA.
- **Bug fix**: Eliminates TypeError on every email submission in next-step.html.
- **Re-engagement**: Quiz page CTA band now has actionable buttons.

## Risks

### CRITICAL — Exposed API Key (NOT fixed in this iteration)
**File:** `next-step.html` line 508  
**Issue:** The Resend API key (`re_daqk4v5i_6UYKkNjgt6z5SxzAnXBgGgZt`) is hardcoded in client-side JavaScript. Anyone can extract it from page source and send unlimited emails as `hello@oneyco.com.au`.  
**Recommendation:** Move email sending to a server-side function (Supabase Edge Function or similar proxy) immediately. The early-bird page already uses a Supabase function pattern — replicate it for the email send.  
**Severity:** Critical. This is an OWASP Top 10 vulnerability (Sensitive Data Exposure). The key should be rotated after moving server-side.

### Medium — next-step.html uses separate design system
The email capture page uses its own inline CSS rather than the shared `brand.css`/`tool-shell.css`. This creates visual inconsistency during the highest-intent moment of the funnel. A future iteration should unify it with the brand shell.

## Next Actions
1. **Immediate**: Rotate the Resend API key and move email sending to a Supabase Edge Function
2. **Next iteration**: Unify next-step.html with the shared brand shell CSS
3. **Next iteration**: Re-enable broker consultation CTA (Layer 3) when licence is active
4. **Consider**: Pass quiz/assessment score data to next-step.html via URL params for personalised report content
5. **Consider**: Add analytics events for CTA clicks on the new "Get My Free Report" buttons
