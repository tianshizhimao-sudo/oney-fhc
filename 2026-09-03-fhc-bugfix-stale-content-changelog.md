# FHC Changelog — 2026-09-03 — Bug Fixes + Stale Content Refresh

## Business Objective
Improve FHC conversion rate, credibility, and stability by fixing active bugs that break
the post-assessment flow and removing stale date references that undermine the "source-fresh"
brand positioning.

## Scope
- Bug fixes (2)
- Content corrections (4 pages)
- No structural or architectural changes

## Detailed Changes

### 1. Fix: next-step.html — JS crash on email submit (CRITICAL)
- **File:** `next-step.html` line 551
- **Issue:** After a successful email form submission, the page called
  `document.querySelector('.broker-card').scrollIntoView(...)` but the `.broker-card`
  element is inside a commented-out HTML block (broker CTA removed until licence is active).
  This threw a `TypeError` on every successful submission, breaking the post-conversion UX.
- **Fix:** Added null guard — only scrolls if `.broker-card` exists.

### 2. Fix: early-bird.html — Bottom form gave no success/error feedback
- **File:** `early-bird.html`
- **Issue:** The page has two email capture forms (hero and bottom band). The `setMessage()`
  function only targeted `#success-msg` and `#error-msg` in the top form. Users submitting
  from the bottom form saw no confirmation, creating uncertainty about whether signup worked.
- **Fix:** Added `#success-msg-2` and `#error-msg-2` elements to the bottom form. Updated
  `setMessage()` to write to both top and bottom form message containers simultaneously.

### 3. Content: rate-impact.html — Remove stale "17 March 2026" date
- **File:** `rate-impact.html`
- **Issue:** Hero badge read "RBA Decision — 17 March 2026" (6 months stale). OG description
  also referenced the specific date. RBA banner text was date-specific.
- **Fix:** Hero badge changed to generic "RBA Rate Change Calculator". OG description updated
  to evergreen copy. Banner text made generic (references scheduled meeting dates, not a
  specific one).

### 4. Content: banker-view.html — Remove stale RBA banner date
- **File:** `banker-view.html`
- **Issue:** RBA banner referenced "17 March 2026" specifically.
- **Fix:** Banner text updated to generic phrasing matching rate-impact.html.

### 5. Content: about.html — Align with current quiz structure
- **File:** `about.html`
- **Issue:** "How It Works" section said "Answer 7 Questions" and "Takes about 3 minutes",
  but the actual Quick Check has 5 steps and takes ~60 seconds. CTA said "3-Min Quiz" with
  "7 questions". FAQ dimension question referenced old scoring model.
- **Fix:** Updated to "Answer 5 Quick Questions", "Takes about 60 seconds", CTA to
  "60-Second Quick Check", "5 questions". FAQ answer updated to describe actual scoring
  dimensions (capital strength, pressure load, income resilience, timing).

## Expected Impact
- **next-step.html fix:** Eliminates JS crash that blocked post-email-submission UX for
  100% of users who complete the form. Direct conversion improvement.
- **early-bird.html fix:** Users submitting from bottom form now see confirmation, reducing
  duplicate submissions and abandonment.
- **Stale content removal:** Pages no longer display 6-month-old dates, preserving
  "source-fresh" credibility claim.
- **about.html alignment:** New users reading "How It Works" get accurate expectations,
  reducing confusion when they enter the actual quiz.

## Risks

### FLAGGED — NOT FIXED THIS ITERATION

**CRITICAL SECURITY: Resend API key exposed in client-side JavaScript**
- **File:** `next-step.html` line 507
- **Key:** `re_daqk4v5i_6UYKkNjgt6z5SxzAnXBgGgZt`
- **Risk:** Anyone can extract this key from browser DevTools and use it to send emails
  from `hello@oneyco.com.au` via the Resend API. This is a production secret that should
  be moved to a server-side function (similar to the Supabase Edge Function pattern already
  used in `early-bird.html`).
- **Reason not fixed:** Requires architectural change (new server-side endpoint). Flagged
  for immediate manual remediation.

**MODERATE: early-bird.html "Last checked" date is 31 Jul 2026**
- The source settings panel shows "Last checked: 31 Jul 2026" which is now 5 weeks stale.
- The RBA rate (4.35%) and effective date (17 Jun 2026) should be verified against current
  RBA data before updating these values.

**LOW: Hardcoded financial figures across multiple pages**
- `banker-view.html`: Assessment rate 7.35%, HEM values [2100, 2500, 2900, 3300]
- `quiz.score.js`: Unemployment rate "4.5%"
- These become stale over time. Consider a centralized config for rate-sensitive values.

## Next Actions
1. **URGENT:** Rotate or revoke the Resend API key in `next-step.html` and move email
   sending to a Supabase Edge Function (follow `early-bird.html` pattern)
2. Verify current RBA cash rate and update `early-bird.html` source settings dates
3. Consider adding `next-step.html` to the user journey (currently orphaned — no page
   links to it)
4. Consider linking `banker-view.html` and `rate-impact.html` from the main nav or
   adding CTAs from specialist tool result pages
5. Align `about.html` visual design with the shared brand shell used by the rest of
   the suite
