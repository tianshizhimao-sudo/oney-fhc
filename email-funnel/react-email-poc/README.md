# FHC / Rate Recheck React Email POC

Status: **review-ready draft** for Dong review. Not connected to Resend, Supabase, cron, webhooks, or any live send workflow.

## Template set

- `emails/email-0-confirmation.tsx` — transactional confirmation after a user submits/opts in.
- `emails/rate-recheck-borrowing-confidence.tsx` — Email 1: “Your rate didn’t change. Your approval might have.”
- `emails/email-2-broker-prep.tsx` — Email 2: broker/lender conversation preparation checklist.
- `emails/email-3-recheck-reminder.tsx` — Email 3: requested approval freshness reminder.

## Source freshness

- `lib/sourceFacts.ts` holds RBA/APRA facts in one shared typed object.
- `scripts/source-fresh-lint.mjs` blocks stale hard-coded strings such as old RBA/assessment-rate examples.
- `scripts/render-preview.mjs` renders every template to HTML + plain text and checks compliance markers.

## Consent-field gate

This POC is allowed to render templates, but it is **not allowed to connect to live sending** unless each marketing/nurture recipient has proof-of-consent metadata stored with the lead/preference record.

Minimum fields before any commercial follow-up email:

| Field | Required | Notes |
|---|---:|---|
| `email` | Yes | Normalised delivery identity. |
| `source` | Yes | Example: `rate-recheck`, `fhc`, `bank-ready-score`. |
| `consent_type` | Yes | Must be `express` for marketing/nurture sequence. Use `transactional_only` for confirmation-only. |
| `consent_captured_at` | Yes for marketing | Timestamp proving when consent was captured. |
| `consent_capture_method` | Yes for marketing | Example: `form`, `phone`, `face_to_face`. |
| `consent_capture_source` | Yes for marketing | Product/form where consent was captured. |
| `marketing_consent` | Yes | Must be `true` only when express consent proof exists. |
| `manage_preferences_url` | Yes | User control link. Placeholder mailto is acceptable for POC only. |
| `unsubscribe_url` | Yes for marketing | Required for commercial emails. Placeholder mailto is acceptable for POC only. |
| `last_source_check_at` | Yes | RBA/APRA facts must be checked before send. |
| `source_fact_version` | Yes | Stable audit marker for rendered facts. |

Implemented guardrails:

- `scripts/consent-gate-lint.mjs` checks that consent fields exist in the shared schema and marketing templates.
- `npm run review` now runs source-fresh lint, consent-gate lint, render preview, and TypeScript checks.
- SQL migration draft: `supabase/migrations/20260807_rate_recheck_consent_preferences.sql`.

## Review commands

```bash
npm install
npm run review
npm run email
```

Preview server: http://localhost:3000

## Guardrails

- General information only; not credit advice.
- No approval, eligibility, borrowing amount, or “best loan” promise.
- Commercial emails include consent-aware preference management and unsubscribe wording.
- Transactional confirmation explains it is only a confirmation, not an approval or eligibility decision.
- Marketing/nurture emails must only send when `marketing_consent=true` and express consent proof exists.

## Before any live send

- Reconfirm RBA/APRA source facts from official sources and update `lib/sourceFacts.ts`.
- Confirm consent capture and unsubscribe/manage-preferences URLs are real.
- Apply and verify the consent/preference storage migration before adding new POST fields to any live capture flow.
- Render and review HTML + plain text output.
- Connect only after a separate Resend/Supabase implementation review.
