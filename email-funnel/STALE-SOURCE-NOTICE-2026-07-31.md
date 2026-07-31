# Stale Source Notice — FHC Legacy Email Funnel

Date: 2026-07-31
Status: do not send externally

The legacy HTML email funnel in this folder was useful as an early prototype, but it contains hard-coded March 2026 rate copy:

- `RBA 4.10%`
- `7.10% assessment rate`
- “same one banks use” wording that is too absolute for a reusable nurture flow

Current direction:

- Use the React Email POC in `react-email-poc/` for the next iteration.
- Keep source facts in props / source-facts modules, not buried in paragraph copy.
- Run source-fresh QA before any external send.
- Maintain general-information-only / not-credit-advice framing.
- Include consent-aware preference management and unsubscribe paths for commercial emails.

This notice does not delete or move any legacy file. It only marks the old funnel as unsafe to reuse without review.
