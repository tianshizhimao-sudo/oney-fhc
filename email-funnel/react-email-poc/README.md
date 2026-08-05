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

## Before any live send

- Reconfirm RBA/APRA source facts from official sources and update `lib/sourceFacts.ts`.
- Confirm consent capture and unsubscribe/manage-preferences URLs are real.
- Render and review HTML + plain text output.
- Connect only after a separate Resend/Supabase implementation review.
