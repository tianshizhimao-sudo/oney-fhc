# Changelog — 2025-06-25 — FHC Email Capture Flow Fix

## Business Objective
Improve conversion and user experience on the email capture page (next-step.html) — the critical step between quiz completion and lead capture.

## Scope
- `next-step.html` only (email capture / post-quiz page)
- No architectural or structural changes
- No backend changes

## Detailed Changes

### 1. Fix broken post-email JavaScript error
- **What**: `document.querySelector('.broker-card').scrollIntoView()` threw an uncaught TypeError because `.broker-card` is inside an HTML comment (broker licence not yet active).
- **Fix**: Added null guard — `const brokerCard = document.querySelector('.broker-card'); if (brokerCard) ...`
- **Why**: Uncaught JS errors in the success path could break analytics tracking and leave users in a broken state.

### 2. Add inline form validation error messages
- **What**: Form validation previously only showed a shake animation + red border. No text explained what was wrong.
- **Fix**: Added `showFieldError()` / `clearFieldError()` helpers that insert visible text messages below invalid fields ("Please enter your first name", "Please enter a valid email address"). Errors auto-clear on input. Added `.field-error` CSS class.
- **Why**: Users who don't understand why the form rejected their input will abandon. Clear text reduces friction.

### 3. Fix misleading thank-you message
- **What**: After email success, the thank-you text said "scroll down to see how a free 15-minute chat with Dong can fast-track your borrowing journey" — but the broker card below is commented out.
- **Fix**: Updated text to "explore our other assessment tools to get an even deeper picture of your borrowing position."
- **Why**: Directing users to scroll to content that doesn't exist erodes trust and creates confusion.

### 4. Add engagement CTAs to thank-you state
- **What**: After successful email submission, the user hit a dead end with no next action.
- **Fix**: Added two CTA links below the thank-you message: "Try the Banker's View tool →" (primary button) and "← Explore all tools" (text link).
- **Why**: Keeps users engaged after lead capture instead of bouncing. Drives traffic to deeper assessment tools.

## Expected Impact
- **Conversion**: Eliminates JS error that could silently break the post-submit flow
- **Retention**: Users who submit email now have a clear next step instead of a dead end
- **UX**: Form errors are now self-explanatory, reducing abandonment
- **Trust**: No more "scroll down" to nothing

## Risks
- **LOW**: CSS animation reuse (`fadeUp`) — already defined in the page, no conflict
- **FLAGGED (not fixed)**: Resend API key (`re_daqk4v5i_...`) remains hardcoded in client-side JavaScript (line 535). This is a security risk — anyone reading page source can send emails from the Oney domain. Recommend moving to a server-side proxy or Supabase edge function in a future iteration.
- **FLAGGED (not fixed)**: No rate limiting on email form submission. A future iteration should add client-side throttling or server-side protection.

## Next Actions
1. **CRITICAL**: Move Resend API key to server-side (Supabase edge function or similar)
2. **HIGH**: Uncomment broker CTA section when licence is active; test scroll behavior before going live
3. **MEDIUM**: Add rate limiting to email form submission
4. **LOW**: Add ARIA labels to theme switcher dots across all pages for accessibility
