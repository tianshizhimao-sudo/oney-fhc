# Changelog — FHC Auto-Advance + Exclusive Multi-Select

**Date:** 2026-04-17
**Author:** Claude Code (Oney AI Ops)
**Branch:** claude/lucid-hopper-Lwtuo

---

## Business Objective

Two quick wins to reduce quiz friction and fix a scoring correctness bug:

1. **P1 — Auto-advance:** Single-choice steps now advance automatically after selection (320ms delay), eliminating ~40% of clicks on the Quick Check quiz and delivering on the "60-second" promise.
2. **P2 — Mutual exclusivity:** "None of these" in the pressure step now correctly clears other selections (and vice versa), preventing contradictory scoring where +10 bonus AND penalties applied simultaneously.

## Scope

- **In scope:** Auto-advance logic in tool-engine.js (works for all tools, triggers only when all required fields in a step are filled). Exclusive multi-select support via `field.exclusive` array. Quiz schema updated.
- **Out of scope:** Backend email capture (P3 upgrade), cross-tool state seeding.

## Detailed Changes

### `assets/js/tool-engine.js`
- Added `autoAdvanceTimer` variable in create() scope
- **P1:** After a single-choice card click, checks if all required fields in the current step are filled. If yes, sets a 320ms timer then calls `goNext()`. Timer is cleared on Back navigation and on any new click.
- **P2:** Multi-select handler now reads `field.exclusive` array. Clicking an exclusive value (e.g. "none") clears all other selections. Clicking a non-exclusive value removes any exclusive values from the array. Toggle-off (deselect) works normally for both types.
- `goBack()` clears auto-advance timer to prevent stale advances

### `assets/js/quiz.schema.js`
- Added `exclusive: ['none']` to the pressure field definition

## Expected Impact

- **P1:** Quiz completion clicks drop from ~10 (5 selections + 5 Continue clicks) to ~6 (5 selections + 1 Continue on multi step). Matches "60-second" hero promise. Also benefits specialist tools — PAYG/Business/Investor steps with all-choice fields auto-advance once the last field is filled.
- **P2:** Eliminates contradictory scoring. Users who click "None of these" no longer get a garbled +10 bonus alongside penalties. Trust signal preserved.

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Auto-advance feels too fast on slow connections | Low | 320ms delay gives visual confirmation; Back button always available |
| Users may not realise they can go back after auto-advance | Low | Back button remains visible; scroll-to-step on advance provides orientation |
| Exclusive logic only applies when `field.exclusive` is set | None | Intentional — opt-in per field, no effect on fields without the property |

## Next Actions

1. **P3 backend upgrade** — Replace mailto with Supabase/Resend POST for seamless email capture
2. **A/B test** — Measure quiz completion rate before/after auto-advance
