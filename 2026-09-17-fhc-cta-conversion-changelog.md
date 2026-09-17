# FHC Changelog — 2026-09-17 — CTA Conversion & Mobile Nav

## Business Objective
Increase conversion by eliminating dead-end pages and reducing mobile friction. Every tool page should offer a clear path to booking a consultation or exploring another tool.

## Scope
- quiz.html
- payg.html
- business.html
- investor.html
- assets/js/brand.js

## Detailed Changes

### 1. Quiz CTA band — added action buttons
**File:** `quiz.html`
**What:** The bottom CTA band ("Not sure which tool is right?") had headline + body text but zero clickable actions. Users who scrolled past the assessment form hit a dead-end.
**Fix:** Added primary CTA ("Start the Quick Check") anchoring back to the form, plus a secondary ghost button ("Browse specialist tools") linking to `index.html#tools`. Both carry `data-analytics` attributes for tracking.

### 2. Deep-check pages — added CTA bands
**Files:** `payg.html`, `business.html`, `investor.html`
**What:** None of the three specialist tool pages had a CTA band between the assessment section and the footer. Users who didn't complete the form (or who scrolled after seeing results) had no conversion surface.
**Fix:** Added a CTA band to each page with:
- Contextual headline matching the tool's voice
- Primary CTA: "Book a 15-min chat" → oneyco.com.au/#contact
- Secondary CTA: "Start the Quick Check" → quiz.html
- All buttons carry `data-analytics` attributes for Plausible event tracking

### 3. Mobile nav auto-close
**File:** `assets/js/brand.js`
**What:** On mobile, tapping a nav link left the hamburger menu overlay open, requiring a second tap on the hamburger to close it.
**Fix:** Added event listeners on all `.nav-links a` elements to remove the `nav-open` class on click. Menu now closes immediately when any nav link is tapped.

## Expected Impact
- **Quiz page:** Eliminates a dead-end CTA band; users who scroll past the form now have a clear re-engagement path.
- **Deep-check pages:** Adds conversion surface that was entirely absent. Users who don't finish (or who finish and keep scrolling) now see booking + tool-exploration CTAs.
- **Mobile nav:** Reduces friction for all mobile visitors across all pages.

## Risks
- **Low risk.** All changes are additive HTML/JS — no schema, scoring, or engine logic was modified.
- CTA bands use the existing `.cta-band` CSS class already styled across all three themes (dark, purple, light).
- Nav auto-close uses the same `nav-open` class toggle the hamburger already uses.

## Next Actions
- Monitor Plausible events: `payg_cta_band_book`, `business_cta_band_book`, `investor_cta_band_book`, `quiz_cta_band_start` to measure CTA engagement.
- Consider A/B testing CTA copy ("Book a 15-min chat" vs "Get a free readiness review") once baseline data is available.
- Review early-bird.html source facts (RBA rate "Last checked" date is 2026-07-31 — may need refresh).
