# 2026-08-27 — FHC Security Fix + UX Improvements

## Business Objective
Remove a critical security vulnerability (exposed API key), fix stale content that undermines user trust, and improve conversion flow by adding missing CTAs.

## Scope
- `next-step.html` — security fix + bug fix
- `rate-impact.html` — stale content cleanup
- `quiz.html` — conversion CTA addition

## Detailed Changes

### 1. SECURITY: Removed exposed Resend API key (next-step.html)
- **Before:** Client-side JavaScript contained a hardcoded Resend API key (`re_daqk4v5i_...`) at line 505, visible to anyone who inspects page source. This key could be used to send arbitrary emails through the Oney & Co Resend account.
- **After:** Replaced direct Resend API call with a Supabase Edge Function pattern (`/functions/v1/fhc-report-request`), matching the approach already used in `early-bird.html`. Email rendering now happens server-side.
- **ACTION REQUIRED:** (1) Create the `fhc-report-request` Supabase Edge Function to handle email sending. (2) **Rotate the Resend API key immediately** — the old key is in git history and must be considered compromised.

### 2. Fixed JS null reference error (next-step.html)
- **Before:** After successful email submission, code tried to scroll to `.broker-card` element which is commented out (hidden until broker licence is active), causing a runtime error.
- **After:** Removed the scroll-to-broker-card call. The thank-you state now displays cleanly without errors.

### 3. Updated stale RBA date references (rate-impact.html)
- **Before:** Hero badge, banner, and meta descriptions referenced "RBA Decision — 17 March 2026" which is 5+ months stale. The conditional banner script was also dead code (date had passed).
- **After:** Replaced with evergreen "Rate Change Calculator" copy. Removed the dead banner script. Updated meta descriptions to be date-independent.

### 4. Added CTA buttons to quiz.html bottom band
- **Before:** The bottom CTA band had text ("Not sure which tool is right?") but no actionable buttons — a conversion dead-end.
- **After:** Added two CTA buttons: "Start the Quick Check above" (scrolls to quiz) and "Browse all tools" (links to index.html#tools).

## Expected Impact
- **Security:** Eliminates exposed API key vulnerability. Prevents unauthorized email sending.
- **Trust/UX:** Removes stale date references that signal an unmaintained product.
- **Conversion:** Adds missing CTA in quiz.html bottom band, reducing bounce at page bottom.
- **Stability:** Fixes JS error that broke the post-submission flow in next-step.html.

## Risks
- The `fhc-report-request` Supabase Edge Function does not exist yet — email sending on next-step.html will fail until it's created. The form will show a graceful error message.
- The old Resend API key remains in git history — **must be rotated on the Resend dashboard**.
- Rate-impact.html comparison table description still hardcodes "6.00%" as the base rate — this is user-adjustable via the input, so not a blocker.

## Next Actions
1. **URGENT:** Rotate the Resend API key on the Resend dashboard
2. **URGENT:** Create `fhc-report-request` Supabase Edge Function (receives `{name, email, score, grade}`, sends personalized report email via Resend server-side)
3. Consider connecting deep-check result CTAs to `next-step.html` to complete the email capture funnel
4. Consider uncommenting the broker CTA section in `next-step.html` once broker licence is active
5. Review early-bird.html RBA data freshness (currently shows "RBA cash rate target: 4.35%", "Last checked: 31 Jul 2026")
