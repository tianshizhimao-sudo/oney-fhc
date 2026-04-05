# Email Funnel System — Quick Summary

## What Was Built

A complete 3-email marketing automation sequence for the Oney & Co FHC early-bird program. When users sign up for early access, they automatically receive a personalized email journey over 7 days.

## Files Created

### Email Templates (HTML)
- `email-1-confirmation.html` — Immediate confirmation email
- `email-2-education.html` — Day 3 education on banking assessment
- `email-3-value.html` — Day 7 founder story + conversion CTAs

### Supabase Setup
- `migrations/20260405_email_sequence.sql` — Database schema for email tracking
  - Creates `email_sequence_log` table
  - Tracks all sends (when, status, errors)
  - Adds `email_sequence_status` to leads table

### Edge Functions
- `fhc-early-bird/index-v2.ts` — Triggers on user signup
  - Inserts lead into database
  - Sends Email 1 immediately
  - Schedules Emails 2 & 3 for Day 3 and Day 7
  - Logs all activity

- `send-scheduled-emails/index.ts` — Runs every 5-15 minutes
  - Checks for pending scheduled emails
  - Sends them on schedule
  - Updates database with results

### Documentation
- `README.md` — Complete system documentation (components, schema, setup)
- `DEPLOYMENT.md` — Step-by-step deployment guide (7 phases)
- `EMAIL_SEQUENCE.md` — Detailed email strategy, copy, timing, psychology
- `SUMMARY.md` — This file

## How It Works

### 1. User Signs Up
User enters email on `https://fhc.oneyco.com.au/early-bird.html`

### 2. Instant Confirmation Email
System immediately sends Email 1:
- Subject: "You're on the list 🎉 — FHC Early Bird"
- Content: Confirms $29 early-bird pricing, outlines FHC value
- CTA: "Learn More About FHC"

### 3. Day 3 Education Email
System automatically sends Email 2:
- Subject: "How Banks Really Assess You (It's Not What You Think)"
- Content: 7.10% assessment rate explained, 3 common myths debunked
- CTA: "Try the Bank-Ready Score" (free tool)

### 4. Day 7 Conversion Email
System automatically sends Email 3:
- Subject: "Your First Home — Closer Than You Think"
- Content: Dong's founder story + FHC value prop + urgency
- CTAs: "Get FHC for $29" or "Book Free 15-Min Call"

### 5. Email Tracking
Every send is logged with:
- Recipient email
- Send time (scheduled vs actual)
- Status (sent/scheduled/failed)
- Errors (if any)
- Resend message ID (for webhook integration)

## Key Features

✓ **Automated sequences** — No manual sending, runs on schedule
✓ **Responsive HTML** — Works on desktop, tablet, mobile, dark mode
✓ **Bilingual copy** — English primary + Chinese translations
✓ **Tracking & logging** — Complete audit trail of all sends
✓ **Error handling** — Graceful failures, detailed error messages
✓ **Idempotent** — Safe to retry, won't send duplicates
✓ **Scalable** — Processes 100s of emails efficiently
✓ **Compliant** — CAN-SPAM, GDPR, unsubscribe built-in

## Technology Stack

- **Email Service**: Resend.com (reliable, international)
- **Database**: Supabase (PostgreSQL with real-time)
- **Scheduling**: Resend scheduled_at API + pg_cron or external scheduler
- **Functions**: Supabase Edge Functions (Deno/TypeScript)
- **Templates**: Inline CSS HTML (email-safe, no JS)

## Deployment

### Quick Setup (30 minutes)
1. Apply database migration: `supabase db push`
2. Deploy edge functions: `supabase functions deploy [function-name]`
3. Set environment variables (Resend API key, service role key)
4. Configure scheduler (pg_cron or external)
5. Test with real email signup

### Full instructions in `DEPLOYMENT.md`

## Expected Performance

### Metrics
- Email 1 (confirmation): 35-45% open rate
- Email 2 (education): 25-35% open rate
- Email 3 (conversion): 20-25% open rate
- Overall funnel conversion: 2-4% (signup to FHC purchase)

### Example with 1000 early-bird signups
```
Email 1 Sent:        1000 (100%)
Email 1 Opened:      ~400 (40%)
Email 1 Clicked:     ~60 (6%)

Email 2 Sent:        1000 (100%)
Email 2 Opened:      ~280 (28%)
Email 2 Clicked:     ~60 (6%)

Email 3 Sent:        1000 (100%)
Email 3 Opened:      ~220 (22%)
Email 3 Clicked:     ~50 (5%)
Email 3 → Purchase:  ~20-30 people (2-3%)
Email 3 → Call:      ~20-30 people (2-3%)
```

## What Happens If Something Breaks

### Email 1 not sending immediately?
- Check Resend API key is set
- Check Supabase function logs
- Test with curl command provided in DEPLOYMENT.md

### Emails 2/3 not scheduled?
- Check scheduler is running (pg_cron or external)
- Verify `send-scheduled-emails` function is deployed
- Check function logs for errors

### Emails going to spam?
- Verify Resend domain is verified (DNS records)
- Check email content for spam triggers
- Test sender reputation at MXToolbox

See DEPLOYMENT.md for full troubleshooting guide.

## Files Map

```
/oney-fhc/
  early-bird.html                  ← Main signup page (already exists)
  email-funnel/
    README.md                       ← Full documentation
    DEPLOYMENT.md                   ← Setup instructions
    EMAIL_SEQUENCE.md              ← Strategy & psychology
    SUMMARY.md                      ← This file
    email-1-confirmation.html       ← Template (immediate)
    email-2-education.html          ← Template (day 3)
    email-3-value.html              ← Template (day 7)

/supabase/
  migrations/
    20260405_email_sequence.sql    ← Database schema
  functions/
    fhc-early-bird/
      index-v2.ts                  ← Signup trigger
    send-scheduled-emails/
      index.ts                     ← Scheduler processor
```

## Next Steps

1. **Review** email templates and copy (email-*.html files)
2. **Deploy** database migration (20260405_email_sequence.sql)
3. **Deploy** edge functions (index-v2.ts, send-scheduled-emails/index.ts)
4. **Configure** scheduler (pg_cron or external)
5. **Test** with test email signup
6. **Launch** to early-bird users

## Support

- **Setup questions** → See DEPLOYMENT.md
- **Email strategy questions** → See EMAIL_SEQUENCE.md
- **System questions** → See README.md
- **Implementation questions** → Check function code comments

## Success Criteria

You'll know it's working when:

✓ User receives Email 1 within 1 minute of signup
✓ `email_sequence_log` table shows 3 records per signup
✓ Email 1 status is "sent"
✓ Email 2 status is "scheduled" with sent_at = now + 3 days
✓ Email 3 status is "scheduled" with sent_at = now + 7 days
✓ User receives Email 2 exactly 3 days later
✓ User receives Email 3 exactly 7 days later
✓ Zero bounce errors in logs
✓ CTR increases on Email 3 vs Email 1 (conversion focus)

## Key Insights

### Why This Sequence Works

1. **Email 1** (Confirmation): Satisfies user's immediate need ("Did it work?")
   - Builds trust immediately
   - Reinforces value while excitement is high

2. **Email 2** (Education): Provides value when interest is fading
   - Educates on real banking assessment
   - Positions Dong as expert insider
   - "Aha moment" creates motivation for next email

3. **Email 3** (Conversion): Final push with low friction
   - Founder story creates emotional connection
   - Dual CTAs let user choose their path
   - Urgency (early-bird closes) motivates action

### Why The Timing Works

- Day 0: Signup happens, Email 1 goes out while user is most engaged
- Day 3: Interest naturally fading, Email 2 re-engages with value
- Day 7: User has had time to think, Email 3 asks for decision

### Why This Copy Works

- **Assessment rate (7.10%)**: Specific, credible, memorable number
- **Three myths**: Scannable format, debunks misconceptions, builds trust
- **Founder story**: Personal, relatable, establishes credibility
- **Dual CTAs**: Removes decision paralysis, captures hesitant buyers

## Roadmap

### Phase 1 (Current)
- 3-email funnel for early-bird signups
- Basic tracking in `email_sequence_log`

### Phase 2 (Suggested)
- Add Email 4 (Day 14): Re-engagement for non-openers
- Add Email 5 (Day 21): Final "last chance" before price increase
- Implement bounce/complaint webhook handling

### Phase 3 (Suggested)
- A/B testing different subject lines, CTAs, timings
- Analytics dashboard for funnel metrics
- Segmentation (different sequences for PAYG vs self-employed)
- Post-purchase email sequence (how to use FHC)

---

**Version**: 1.0
**Created**: 2026-04-05
**Status**: Ready for deployment
**Brand**: Oney & Co — "Don't ask AI. Ask Oney."
