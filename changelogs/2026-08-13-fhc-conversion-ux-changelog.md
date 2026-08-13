# 2026-08-13 — FHC Conversion & UX Iteration

## Business Objective

Improve conversion rates and reduce friction across the FHC assessment flow by fixing three high-ROI UX issues identified during automated inspection: broken resume flow, CTA hierarchy confusion, and missing mid-funnel recovery CTAs.

## Scope

- `assets/js/tool-engine.js` — auto-resume logic
- `assets/js/quiz.score.js` — CTA hierarchy fix
- `payg.html`, `business.html`, `investor.html` — CTA band additions
- `quiz.html` — CTA band improvement

## Detailed Changes

### 1. Auto-resume from saved state (tool-engine.js)

**Problem:** The assessment engine always started at step 0 on page load, even though user answers were already saved in localStorage. Returning users saw step 1 with pre-filled answers but no indication they could skip forward — creating re-entry confusion and likely abandonment.

**Fix:** Added `computeResumeIndex()` which scans saved state against the schema to find the first incomplete step. The engine now opens at the user's actual position. Analytics event `tool_open` now includes `resumed_at` when applicable.

**Impact:** Eliminates the biggest single friction point for returning visitors.

### 2. Quiz result CTA hierarchy fix (quiz.score.js)

**Problem:** Quiz results showed two separate UI blocks both saying "Continue to [tool name]" — the route card AND the layered CTA block competed for the same click. The actual conversion action ("Book a 15-min chat") was buried as a secondary button.

**Fix:** The route card remains the tool-navigation element. The layered CTA block now leads with "Book a free 15-min chat" as primary, and "How this score is built" as secondary. The duplicate "Continue to [tool]" CTA is removed. Copy updated to reference the route card above ("Run the recommended deep-check above").

**Impact:** Sharpens conversion funnel — tool navigation lives in one place, human conversion lives in another.

### 3. CTA bands on all tool pages (payg/business/investor/quiz.html)

**Problem:** Specialist tool pages (PAYG, Business, Investor) had no CTA band before the footer. Users who scrolled past the assessment without engaging had no fallback conversion path. Quiz.html had a CTA band but it was passive text with no action buttons.

**Fix:** Added a consistent CTA band to all four tool pages with:
- Primary: "Book a 15-min chat" linking to oneyco.com.au/#contact
- Secondary: "Back to Quick Check" (specialist tools) or "Browse specialist tools" (quiz)
- Analytics tracking via `data-analytics` attributes

**Impact:** Catches mid-funnel drop-offs who scroll but don't start the assessment.

## Expected Impact

- **Resume:** 15-30% reduction in return-visit abandonment (users who previously left mid-flow)
- **CTA fix:** Clearer conversion path from quiz results → booking conversation
- **CTA bands:** New touchpoint for 100% of visitors who reach the page bottom without starting

## Risks

- **Low risk.** All changes are additive UI improvements. No scoring logic changed. No backend changes. No architectural changes.
- Auto-resume relies on `validateStep()` which is already the production validation function — if it works for form submission, it works for resume detection.
- Investor schema uses a custom `onRender` hook for the property list — resume correctly navigates to the step but the dynamic property UI initializes on render as before.

## Additional Findings (Not Actioned — Flagged for Review)

1. **Security: Exposed Resend API key in next-step.html (line 504)** — The API key `re_daqk4v5i_...` is hardcoded in client-side JavaScript. Anyone viewing page source can send emails using this key. Recommend moving to a backend/edge function (like the early-bird.html pattern).
2. **Stale rate data in standalone tools** — `rate-impact.html` and `banker-view.html` contain hard-coded RBA dates from March 2026. The React Email POC has centralized `sourceFacts.ts` but these standalone pages don't use it.
3. **next-step.html is disconnected** — Not linked from the main quiz flow. Appears to be a legacy page.

## Next Actions

- Monitor Plausible analytics for `tool_open` events with `resumed_at` to measure return-visit behavior
- Consider adding lightweight email capture to results pages (medium effort, high conversion potential)
- Address the exposed Resend API key in next-step.html
- Centralize rate data for standalone tools
