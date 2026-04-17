# Changelog — FHC Email Capture (Mailto Fallback)

**Date:** 2026-04-17
**Author:** Claude Code (Oney AI Ops)
**Branch:** claude/lucid-hopper-Lwtuo

---

## Business Objective

Capture moderate/weak-band users (score < 70) who complete an assessment but are not ready to "Book a 15-min chat." Currently these users bounce with no re-engagement path, despite an existing email-funnel infrastructure. This change adds a zero-backend lead-capture mechanism directly on the result page.

## Scope

- **In scope:** New email capture card on all tool result pages when score < 70. Mailto-based fallback (no backend dependency). Analytics event. Full theme support (dark/purple/light). Mobile responsive.
- **Out of scope:** Backend email sending (Supabase/Resend integration), auto-advance quiz UX (P1), pressure-step mutual exclusivity fix (P2), cross-tool state seeding.

## Detailed Changes

### `assets/js/tool-ui.js`
- Added `renderEmailCapture(result, toolName)` function
  - Returns empty string for scores >= 70 (strong band)
  - Renders an email input + submit button card for scores < 70
  - Shows tool-specific label and score in the description
  - Success state swaps form for a confirmation message
- Exported `renderEmailCapture` on `window.OneyToolUI`

### `assets/js/tool-engine.js`
- In `showResult()`: Inserted email capture HTML between positives list and layered CTA block
- Added `wireEmailCapture(result)` function:
  - Listens for form submit, validates email
  - Constructs `mailto:hello@oneyco.com.au` with pre-filled subject and body containing: tool name, score, heading, attention items, positives, and user's email
  - Swaps form for success confirmation on submit
  - Fires `result_email_capture` analytics event with tool name and score

### `assets/css/tool-results.css`
- Added `.result-email-capture` card styles (gradient border, centered layout)
- Added `.email-capture-row` flex layout (stacks vertically on mobile <= 480px)
- Added `.email-capture-success` confirmation state with green checkmark
- Added light-theme overrides (`html[data-theme="light"]`)
- Added purple-theme overrides (`html[data-theme="purple"]`)

## Expected Impact

- **Conversion lift:** Captures the large moderate-band segment (score 45-69) that currently exits without a recovery path
- **Lead quality:** Self-selecting — user actively chooses to send their report, indicating genuine interest
- **Analytics:** New `result_email_capture` event enables measuring capture rate vs. result views
- **Funnel continuity:** Captured emails can feed the existing `/email-funnel/` sequence in a future iteration (Resend/Supabase backend)

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Mailto URL may not work in some webviews (e.g., Instagram in-app browser) | Low | Hint text explicitly states "Opens your email client"; fallback is graceful (nothing breaks) |
| Mailto body length could exceed limits on extreme edge cases | Very Low | Tested at 584 chars for worst-case PAYG; well under 2000 char limit |
| Users may expect an automatic email, not a mail-client handoff | Medium | Copy explicitly says "Opens your email client with a pre-filled summary" |

## Next Actions

1. **P1 (auto-advance)** — Implement quiz auto-advance on single-choice steps to match "60-sec" promise
2. **P2 (mutual exclusivity)** — Fix "None of these" coexisting with pressure items in quiz scoring
3. **Backend email capture** — Replace mailto with Supabase/Resend POST (reuse early-bird infrastructure) for seamless "enter email and done" UX
4. **A/B test capture copy** — Test "Get your report" vs. "Save your results" headline on conversion rate
