# 2025-06-18 — FHC Security Fix + Bug Fixes + Conversion Improvement

## Business Objective
Improve FHC stability, security, and conversion by fixing critical vulnerabilities and bugs discovered during routine inspection.

## Scope
- `next-step.html` — security fix + 2 bug fixes
- `quiz.html` — conversion improvement

## Detailed Changes

### 1. SECURITY: Removed exposed Resend API key (CRITICAL)
- **File**: `next-step.html`
- **Issue**: Live Resend API key (`re_daqk4v5i_...`) was hardcoded in client-side JavaScript, allowing anyone to send emails as `hello@oneyco.com.au`
- **Fix**: Replaced direct Resend API call with Supabase edge function pattern (same as `early-bird.html`), using the publishable Supabase key which is safe for client-side use
- **Note**: The Supabase edge function `fhc-early-bird` now receives `source: 'next-step'` to differentiate from early-bird signups. The edge function may need updating to handle this new source and send the appropriate report email.

### 2. BUG FIX: localStorage key mismatch
- **File**: `next-step.html`
- **Issue**: Page read from `oney-fhc-quiz-v1` but the assessment engine saves to `oney-fhc-quiz`. Result: quiz score never displayed on the next-step page.
- **Fix**: Changed key to `oney-fhc-quiz` to match the engine's storage key.

### 3. BUG FIX: Null reference error after email submission
- **File**: `next-step.html`
- **Issue**: After email submit, code called `document.querySelector('.broker-card').scrollIntoView(...)` but the `.broker-card` element is inside an HTML comment (hidden until broker licence is active). This threw a null reference error.
- **Fix**: Added null guard (`if (brokerCard)`) before attempting scroll.

### 4. CONVERSION: Added CTA buttons to quiz bottom band
- **File**: `quiz.html`
- **Issue**: The bottom CTA band had heading and text but no actionable button — dead-end for users who scroll past the assessment.
- **Fix**: Added "Start the Quick Check" (scroll-up) and "Or book a 15-min chat" buttons with analytics tracking.

## Expected Impact
- **Security**: Eliminates the exposed API key vulnerability immediately
- **Bug fixes**: Next-step page will now correctly display quiz scores; no more JS errors after email submission
- **Conversion**: Users who scroll to the bottom of quiz.html now have a clear action path

## Risks
- The Supabase edge function `fhc-early-bird` may need updating to handle `source: 'next-step'` requests and send the personalised report email (currently it handles early-bird signups only). Until updated, next-step email submissions will be captured as leads but may not receive the detailed report email.
- The compromised Resend API key (`re_daqk4v5i_...`) should be rotated in the Resend dashboard as it was previously exposed in a public repository.

## Next Actions
1. **Rotate the Resend API key** in the Resend dashboard (the old key was exposed in client-side code)
2. **Update the `fhc-early-bird` Supabase edge function** to handle `source: 'next-step'` requests and send the personalised report email
3. **Add og:image meta tags** to quiz.html, payg.html, business.html, investor.html for better social sharing
4. **Wire assessment result CTAs** to include a link to next-step.html for email capture (currently the funnel is disconnected)
5. **Consider adding social proof** near the assessment forms (e.g., "X people have completed this check")
