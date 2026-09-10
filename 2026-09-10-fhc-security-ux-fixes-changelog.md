# Changelog: 2026-09-10 — FHC Security & UX Fixes

## Business Objective
Improve FHC tool security, fix broken conversion-critical UX, and update stale content that undermines credibility with finance-aware users.

## Scope
- `next-step.html` — email capture flow (security + UX)
- `rate-impact.html` — hero badge and meta description
- `banker-view.html` — RBA decision banner
- `about.html` — question count accuracy

## Detailed Changes

### 1. CRITICAL: Remove exposed Resend API key (next-step.html)
**Before:** A Resend API key (`re_daqk4v5i_...`) was hardcoded in client-side JavaScript (line 508). Anyone could extract this key from the browser and use it to send emails from `hello@oneyco.com.au`, including spam or phishing.

**After:** Replaced the direct Resend API call with a server-side Supabase Edge Function endpoint (`/functions/v1/fhc-report-email`). The API key is no longer exposed to the client. The function sends only the user's name, email, quiz score, and grade — the email template is now server-side.

**Note:** The Supabase Edge Function `fhc-report-email` needs to be created/deployed to restore email functionality. Until then, the form will show the error state gracefully.

### 2. Fix broken post-email-submission UX (next-step.html)
**Before:** After email submission, JavaScript attempted `document.querySelector('.broker-card').scrollIntoView(...)` but the `.broker-card` element was inside an HTML comment (disabled broker CTA). This threw a `TypeError: null.scrollIntoView` that broke the thank-you flow.

**After:** Removed the broken scroll-to-broker-card code. The thank-you state now displays cleanly without attempting to scroll to a non-existent element.

### 3. Remove stale RBA date references
**rate-impact.html:**
- Hero badge: Changed from "RBA Decision — 17 March 2026" (6 months outdated) to "Rate Change Impact Calculator" (evergreen)
- OG description: Removed stale date reference, replaced with tool description
- Removed expired RBA decision banner and its date-conditional JS

**banker-view.html:**
- Removed expired RBA decision banner (17 March 2026 cutoff already passed)
- Left placeholder div for future banners when a new decision date is configured

### 4. Fix question count mismatch (about.html)
**Before:** "How It Works" section said "Answer 7 Questions" and CTA said "3-Min Quiz" / "7 questions". The actual quiz has 5 steps.

**After:** Updated to "Answer 5 Questions", "2-Min Quick Check", and "5 questions" to match reality.

## Expected Impact
- **Security:** Eliminates risk of unauthorized email sending via exposed API key
- **Conversion:** Fixes broken thank-you UX at the most critical conversion point (post-email-capture)
- **Credibility:** Removes stale dates that signal the tool is unmaintained; fixes factual inaccuracy in question count

## Risks
- **Email functionality temporarily unavailable:** The `fhc-report-email` Supabase Edge Function needs to be deployed to restore the email report feature. The form degrades gracefully (shows error message) until then.
- **Low risk overall:** All changes are surgical — no structural, layout, or scoring logic changes.

## Next Actions
1. **Deploy Supabase Edge Function** (`fhc-report-email`) to handle email sending server-side with the Resend API key stored as an environment secret
2. **Rotate the exposed Resend API key** — the old key should be considered compromised and replaced in the Resend dashboard
3. **Consider re-enabling the broker CTA** on next-step.html (currently commented out, awaiting broker licence)
4. **Add step resume** to tool-engine.js — users who leave mid-assessment must click through already-answered steps, which is a conversion drop-off risk
5. **Fix "None" mutual exclusivity** in quiz pressure multi-select — users can currently select contradictory options
