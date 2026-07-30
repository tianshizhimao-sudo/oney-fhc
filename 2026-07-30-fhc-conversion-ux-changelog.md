# Changelog: FHC Conversion & UX Iteration

**Date:** 2026-07-30
**Scope:** quiz.html, payg.html, business.html, investor.html, rate-impact.html, tool-ui.js, tool-engine.js, tool-shell.css

---

## Business Objective

Improve conversion rate and reduce drop-off across the FHC tool suite by fixing dead-end CTAs, reducing perceived form complexity, and removing stale dated content that undermines credibility.

---

## Detailed Changes

### 1. CTA Band Completeness (quiz, PAYG, Business, Investor pages)

**Problem:** quiz.html CTA band at the bottom contained copy ("Not sure which tool is right?") but no action button — a dead-end for users scrolling past the form. Deep-check pages (PAYG, Business, Investor) had no CTA band at all below the form, losing users who scroll past or abandon.

**Change:**
- Added CTA action buttons to quiz.html CTA band: primary "Start the Quick Check" + secondary "Browse all tools"
- Added CTA band sections to payg.html, business.html, and investor.html with contextually relevant primary CTA (Book a 15-min chat) and secondary CTA (Start the Quick Check)
- All CTAs include `data-analytics` attributes for tracking

**Expected Impact:** Captures users who scroll to the bottom without engaging the form. On mobile, this is the last thing visible before the footer.

### 2. Progress Bar Section Titles

**Problem:** Progress indicator showed generic "Progress 1/4" with no section title — users couldn't preview what's ahead, increasing perceived complexity and drop-off at the form start.

**Change:**
- Modified `renderProgress()` in tool-ui.js to accept and display section title
- Updated tool-engine.js to pass current step's title to the progress renderer
- Changed label from "Progress" to "Step X of Y" with the section title centered between
- Added CSS styling for `.progress-step-title` in tool-shell.css

**Expected Impact:** Reduces perceived cognitive load. Users see "Step 1 of 4 — Your current setup" instead of just "Progress 1/4", which orients them and reduces form abandonment.

### 3. Rate Impact Page — Remove Stale Date References

**Problem:** rate-impact.html contained multiple references to "RBA Decision — 17 March 2026" in the hero badge, OG description meta tag, and a conditional banner. Current date is July 2026 — the content was 4+ months stale, undermining credibility for search visitors.

**Change:**
- Replaced hero badge from "RBA Decision — 17 March 2026" to generic "Rate Change Calculator"
- Changed heading from "Rate Hike" to "Rate Change" (direction-neutral)
- Updated OG description meta tag to remove the March 2026 date
- Removed the conditional RBA banner script (date-gated content that was already hidden but cluttered source)

**Expected Impact:** Removes stale dating that damages trust. Page now works as an evergreen calculator regardless of RBA meeting cycle.

---

## Files Modified

| File | Change |
|------|--------|
| `quiz.html` | Added CTA buttons to existing CTA band section |
| `payg.html` | Added new CTA band section before footer |
| `business.html` | Added new CTA band section before footer |
| `investor.html` | Added new CTA band section before footer |
| `assets/js/tool-ui.js` | `renderProgress()` now accepts and renders step title |
| `assets/js/tool-engine.js` | Passes `step.title` to `renderProgress()` |
| `assets/css/tool-shell.css` | Added `.progress-step-title` styles |
| `rate-impact.html` | Removed stale March 2026 references, made content evergreen |

---

## Risks

- **Low risk:** CTA band additions are purely additive HTML — no existing functionality affected.
- **Low risk:** Progress bar change is backwards-compatible — `stepTitle` parameter is optional; if not passed, no title is shown (same as before).
- **Low risk:** Rate-impact.html changes are copy-only and the conditional banner was already hidden (date had passed).

---

## Next Actions

1. **Monitor analytics** for `*_cta_band_*` events to measure CTA band engagement
2. **Consider:** Adding social proof (completions counter or testimonial) near the form hero to further reduce drop-off
3. **Security (flagged):** Resend API key is hardcoded in `next-step.html` line 507 — should be moved server-side via Supabase edge function
4. **Design consistency:** `next-step.html`, `early-bird.html`, and `about.html` still use standalone CSS rather than the shared brand shell — creates UX discontinuity
5. **Consider:** Adding email capture CTA to deep-check results (currently only available via next-step.html)
