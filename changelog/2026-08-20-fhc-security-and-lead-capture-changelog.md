# 2026-08-20 — FHC: credential removal, lead-capture rewiring, multi-select correctness

**Routine:** `fhc_iteration_run_v1`
**Branch:** `claude/lucid-hopper-0v5bod`
**Status:** Implemented, QA passed (30/30 browser checks, 0 JS errors)

> **Changelog path note:** the routine specifies `/Users/maodong/.../Oney-Co/FHC/`. This run executed in a remote container with no access to that local vault, so the changelog is committed to the repo at `changelog/` instead. Copy it into the vault on the next local sync.

---

## 🚨 Action required by a human (cannot be done from this session)

A **live Resend API key was hardcoded in client-side JavaScript** in `next-step.html` and has been public since **2026-03-16** (commit `5196e5d`) in a **public** GitHub repo with GitHub Pages serving `fhc.oneyco.com.au`.

1. **Revoke `re_daqk4v5i_…` in the Resend dashboard now.** Removing it from the source does **not** remove it from git history — rotation is mandatory.
2. **Review Resend send logs** for sends not originating from the edge functions. The key could send mail as `hello@oneyco.com.au` (phishing / domain-reputation risk).
3. Optionally purge history (`git filter-repo` / BFG) after rotation.

---

## Business Objective

1. Eliminate a live credential exposure on the FHC production surface.
2. Recover the on-site lead-capture path, which had been silently orphaned — every deep-check result was sending finishers **off-site** with zero capture and zero attribution.
3. Remove a scoring/insight contradiction that undermines trust in the score.

Execution priority order applied: conversion → friction → bugs → clarity → semantic stability.

---

## Scope

**In scope (Top 3 only, per routine cap):** credential removal, result→lead-capture CTA wiring, multi-select exclusivity. Copy adjustments needed to keep those changes honest.

**Explicitly out of scope:** no architecture change, no scoring-weight changes, no restructuring of the engine, no changes to the Supabase schema or edge functions.

---

## Detailed Changes

### 1. Removed exposed Resend credential (P0 — security)

`next-step.html`

- Deleted the hardcoded `Authorization: Bearer re_…` header and the entire browser→`api.resend.com` send path, including the inline HTML email template it carried.
- Repointed submission to the **existing** `fhc-early-bird` Supabase edge function (`{ email, name, source: 'fhc-next-step', tool, score }`), which already holds `RESEND_API_KEY` server-side. Same contract `early-bird.html` uses; publishable Supabase key only.
- Fixed a latent crash in the success path: it called `document.querySelector('.broker-card').scrollIntoView(...)`, but the broker card is commented out pending broker licence (`75e975a`) — that threw a `TypeError` on every successful submit.
- Fixed a stale storage read: the page looked for `oney-fhc-quiz-v1`, a key the current engine never writes (it writes `oney-fhc-quiz`), and read a `.score` field that was never persisted. The score chip could never populate.
- Fixed the score chip selector: `querySelector('.chip')` matched the *first* chip ("✅ Health Check Done"), not the score chip. Now targets `#scoreChip`.
- Added `analytics.js` + the Plausible domain meta tag — the page previously had **no** instrumentation at all, so the funnel's final step was unmeasurable.

### 2. Reconnected on-site lead capture (P1 — conversion)

`assets/js/tool-engine.js`, `payg.score.js`, `business.score.js`, `investor.score.js`

- `showResult()` now writes `oney-fhc-last-result` = `{ tool, score, band }` so the static lead-capture page can personalise without reaching into per-tool state.
- Deep-check result CTAs restructured:
  | Tool | Primary (was → now) | Secondary | Tertiary |
  |---|---|---|---|
  | PAYG | Book a 15-min chat → **Email me my results** (`next-step.html`) | Book a 15-min chat | How this score is built |
  | Business | Book a 15-min chat → **Email me my results** | Book a 15-min chat | Open Commercial Intake |
  | Investor | Book a strategy chat → **Email me my results** | Book a strategy chat | How this score is built |
- The Quick Check's primary CTA was **left unchanged** (it must keep routing to the recommended deep-check — that is the funnel).
- Dropped "Try the Business Check" / "Try the PAYG Check" as secondaries: the engine already renders a wrong-tool cross-link block in the same card, so nothing is lost.

### 3. "None of these" is now mutually exclusive (P1 — correctness/trust)

`tool-engine.js`, `tool-ui.js`, `quiz.schema.js`, `business.schema.js`

- Multi-select options accept `exclusive: true`; the engine clears siblings when an exclusive option is picked, and clears exclusive options when a real one is picked. Plain deselect-to-empty still works.
- Marked `None of these` exclusive in Quick Check *Pressure* and Business *Recent change*.
- Previously, selecting "None of these" **and** "Credit card / BNPL" both applied a −7 penalty and a +10 bonus, and rendered "No major liabilities" directly alongside "Credit card / BNPL on file" in the same result.

---

## Expected Impact

- **Security:** removes an actively exploitable send-as-your-domain credential from the public surface (pending rotation).
- **Conversion:** finishers of the three deep checks now land on an on-site capture step instead of bouncing to `oneyco.com.au/#contact`. Every completion becomes an addressable lead with tool + score attached, rather than an untracked exit.
- **Measurement:** new `next_step_email_submit` / `next_step_email_error` events make the final funnel step visible for the first time.
- **Trust:** the score and its narrative can no longer contradict each other.

---

## Risks

| Risk | Severity | Note |
|---|---|---|
| **Key remains in git history** | **High** | Source removal is not rotation. Must be revoked manually. |
| Edge function payload assumption | Medium | `fhc-early-bird`'s source is not in this repo. It is called with `{ email }` plus extra keys (`name`, `source`, `tool`, `score`). Standard destructuring ignores extras, but if the function validates strictly, submits will fail. **Verify one live submit after deploy.** |
| Email content mismatch | Medium | `fhc-early-bird` sends the early-access nurture sequence, not a bespoke report. Page copy was rewritten to promise what actually arrives (results summary + early access), and the fake "$19 → FREE" PDF teaser was removed, since no PDF is generated. To send a distinct report, branch the edge function on `source === 'fhc-next-step'`. |
| Primary-CTA change is a business decision | Low | Demoting "Book a chat" to secondary is reversible in one line per score file. It also sits better with the broker-licence caution below. |
| **Pre-existing, not addressed:** licence inconsistency | Medium | `next-step.html` hides its broker-consult CTA "until licence is active", yet all three deep-check results still promote a broker chat. Worth a compliance decision. |
| `localStorage` unavailable (private mode) | Low | All reads/writes are already try/catch wrapped; degrades to the neutral default chip. |

---

## QA

`qa_status: pass` — 30/30 checks, 0 JS errors. Headless Chromium against a local static server, all outbound calls stubbed so no live request was made.

- Quick Check: full 5-step flow, exclusivity in both directions, deselect-to-empty, empty-required blocking, result render, no contradictory insights, result persistence.
- PAYG: full flow, CTA hrefs, result persistence.
- Investor: full flow incl. dynamic property list, empty-property blocking, extra-zero rent typo guard, no `NaN`/`undefined` in the result view.
- Business: exclusivity on the string-option schema, Commercial Intake link preserved.
- next-step: score chip populated / neutral default with no prior result, `?name=` personalisation, valid submit → thank-you state, invalid email rejected, **no request to `api.resend.com`**, POST reaches the edge function.

`issues_found: []` (all issues listed above were found during inspection and fixed or flagged, not left open).

---

## Next Actions

1. **Rotate the Resend key** and check its send logs. Blocks everything else.
2. Verify one live `next-step.html` submit after deploy, confirming the edge function accepts the extra payload keys and the lead lands with `source='fhc-next-step'`.
3. Decide whether `fhc-early-bird` should branch on `source` to send a results email distinct from the early-access sequence.
4. Resolve the broker-licence inconsistency between `next-step.html` and the deep-check CTAs.
5. Add a secret-scanning pre-commit hook or enable GitHub push protection — this class of leak sat undetected for five months.
6. Candidate for the next iteration (deliberately **not** done here, to respect the Top-3 cap): the engine persists answers but always restarts at step 1, so a user returning to a 4–6 minute deep check re-clicks through every step. Resuming at the saved step is a cheap drop-off win.
