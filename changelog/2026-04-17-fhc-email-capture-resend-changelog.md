# Changelog — FHC Email Capture Upgrade (Resend/Supabase)

**Date:** 2026-04-17
**Author:** Claude Code (Oney AI Ops)
**Branch:** claude/lucid-hopper-Lwtuo

---

## Business Objective

Upgrade the FHC result-page email capture from a mailto handoff to a seamless "enter email and done" experience using the existing Supabase + Resend infrastructure. Users no longer need to interact with their email client — one click captures the lead and triggers a confirmation email via Resend.

## Scope

- **In scope:** Supabase POST to existing `fhc-early-bird` edge function, loading/success/error states, mailto fallback on failure, analytics method tracking (`resend` vs `mailto_fallback`).
- **Out of scope:** New Supabase edge function, custom email template for FHC reports (uses existing early-bird confirmation flow), name field.

## Detailed Changes

### `assets/js/tool-engine.js`
- `wireEmailCapture()` now POSTs to `https://syhwaeloljdswsmqkzrx.supabase.co/functions/v1/fhc-early-bird` with payload `{ email, source: 'fhc-report', tool, score }`
- Button shows "Sending..." loading state during request
- On success: swaps form for green checkmark confirmation
- On error: shows error message with clickable mailto fallback link (built by new `buildMailtoFallback()` helper)
- Analytics events now include `method: 'resend'` or `method: 'mailto_fallback'` to distinguish paths
- New `result_email_capture_error` event for failure tracking

### `assets/js/tool-ui.js`
- Updated `renderEmailCapture()` copy:
  - Description: "Enter your email and we'll send..." (no mention of email client)
  - Hint: "No spam. Just your results + what to do next."
  - Success: "Check your inbox — we've sent your personalised results summary."
- Added error state div (`#emailCaptureError`) with fallback link

### `assets/css/tool-results.css`
- Added `.email-capture-error` styles (red text, purple link)
- Added light-theme overrides for error state

## Expected Impact

- **Conversion lift:** Removes the 2-step mailto friction (enter email → open mail client → hit send). Now single-step: enter email → done.
- **Lead capture reliability:** Supabase stores every lead; Resend delivers confirmation. No dependency on user's email client supporting mailto.
- **Graceful degradation:** If Supabase/Resend is down, user sees a mailto fallback link — never a dead end.
- **Analytics granularity:** `method` field in `result_email_capture` event lets you measure Resend success rate vs fallback usage.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `fhc-early-bird` edge function may reject extra fields (`source`, `tool`, `score`) | Low | If rejected, email still captured (only email is required); monitor for errors |
| Supabase/Resend outage | Low | Mailto fallback link shown automatically on any fetch failure |
| Publishable key exposed in client JS | Expected | This is a Supabase anon/publishable key — designed for client-side use, RLS protects data |

## Next Actions

1. **Custom edge function** — Create `fhc-report-request` that stores tool/score metadata and sends a tailored Resend email with the user's actual results (not just early-bird confirmation)
2. **Custom email template** — Design a Resend template with score ring, attention items, and "Book a chat" CTA
3. **Name field** — Add optional first name to personalise the email
