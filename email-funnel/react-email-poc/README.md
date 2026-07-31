# FHC / Rate Recheck React Email POC

Status: draft for Dong review. Not connected to Resend or any live send workflow.

## What this contains

- `emails/rate-recheck-borrowing-confidence.tsx` — Email 1 POC: “Your rate didn’t change. Your approval might have.”
- `lib/sourceFacts.ts` — source facts object, so RBA/APRA values are not buried in copy.
- `scripts/source-fresh-lint.mjs` — lightweight lint for stale hard-coded rates and required compliance markers.

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
- Commercial email must include consent-aware preference management and unsubscribe path.
- Before external send: confirm RBA/APRA source facts again and render HTML + plain text.
