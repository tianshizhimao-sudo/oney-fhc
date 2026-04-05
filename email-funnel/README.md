# FHC Email Funnel System

A 3-email automated sequence for Oney & Co's First Home Cost Calculator (FHC) early-bird registration program.

## Overview

The FHC email funnel is a sophisticated marketing automation system that nurtures early-bird leads through a 7-day journey:

- **Email 1 (Immediate)**: Confirmation + FHC overview
- **Email 2 (Day 3)**: Education content on how banks assess borrowers
- **Email 3 (Day 7)**: Founder story + value proposition + soft conversion CTAs

## Architecture

### Components

1. **HTML Email Templates** (`email-1-*.html`, `email-2-*.html`, `email-3-*.html`)
   - Pre-built, responsive email templates
   - Inline CSS for email client compatibility
   - Mobile-first responsive design
   - Bilingual (English + Chinese) copy where appropriate

2. **Supabase Migration** (`migrations/20260405_email_sequence.sql`)
   - `email_sequence_log` table for tracking all email sends
   - Indexes for efficient querying and reporting
   - RLS policies for secure access

3. **Edge Functions**
   - `fhc-early-bird/index-v2.ts`: Main funnel trigger (on signup)
   - `send-scheduled-emails/index.ts`: Scheduled send processor

4. **Configuration**
   - Brand colors: `#2ECC85` (green), `#6B4C9A` (purple), `#1A1A2E` (dark bg)
   - Font: Inter
   - Assessment rate: 7.10% (RBA 4.10% + 3% buffer)
   - URLs:
     - FHC: `fhc.oneyco.com.au`
     - Tools: `tools.oneyco.com.au`
     - Main: `oneyco.com.au`

## Email Breakdown

### Email 1: Early Bird Confirmation (Immediate)

**Subject**: "You're on the list 🎉 — FHC Early Bird"

**Content**:
- Confirms early-bird pricing ($29 vs $79)
- Lists 3 core value props with numbered icons
- Highlights locked-in price and launch notification
- Primary CTA: Learn More About FHC

**Purpose**: Transactional confirmation + immediate reinforcement of value

---

### Email 2: Banking Assessment Education (Day 3)

**Subject**: "How Banks Really Assess You (It's Not What You Think)"
**Chinese Subject**: "你知道银行是怎么评估你的吗？"

**Content**:
- **The Real Assessment Rate**: Explains the 7.10% APRA buffer (RBA 4.10% + 3%)
- **Three Common Myths**:
  1. "I can borrow based on my salary" → Reality: Banks use assessment rate, not advertised rate
  2. "20% deposit means I'm safe" → Reality: DTI and serviceability matter more
  3. "Pre-approval means guaranteed" → Reality: Conditions can change
- **CTA**: Try the Bank-Ready Score at `tools.oneyco.com.au/bank-ready-score.html`

**Purpose**: Establish expertise, educate buyer, build trust through banker's perspective

---

### Email 3: Founder Story + Value Prop (Day 7)

**Subject**: "Your First Home — Closer Than You Think"
**Chinese Subject**: "你的首套房，离你有多远？"

**Content**:
- **Dong's Story**: 8 years in Big 4 banking, observations on why people get declined
- **Core Insight**: Rejections are usually about information, not ability to repay
- **FHC Value**: Know real costs/capacity before applying (using 7.10% assessment rate)
- **Dual CTAs**:
  1. Get FHC for $29 (primary)
  2. Book Free 15-Min Strategy Call (secondary)
- **Urgency**: Early-bird pricing closes at launch

**Purpose**: Personal connection, founder credibility, low-friction conversion

---

## Database Schema

### `email_sequence_log` Table

Tracks all email sends for the funnel:

```sql
id                    uuid        PRIMARY KEY
lead_id              uuid        FK to leads.id
email_address        text        Recipient
sequence_number      integer     1, 2, or 3
email_type           text        'confirmation', 'education', 'value'
subject_line         text        The email subject
sent_at              timestamptz When the email was scheduled/sent
resend_message_id    text        Resend API message ID
status               text        'scheduled', 'sent', 'failed', 'bounced'
error_message        text        Error details if failed
created_at           timestamptz Record creation time
updated_at           timestamptz Last update time
```

### `leads` Table Extensions

Added column to existing leads table:
- `email_sequence_status` (text): 'active', 'unsubscribed', 'bounced'

---

## Edge Functions

### 1. `fhc-early-bird` (Main Funnel Trigger)

**Trigger**: When user submits email on `early-bird.html`

**Process**:
1. Validates email format
2. Checks if email already registered (idempotent)
3. Inserts lead into `leads` table with `source: 'fhc-early-bird'`
4. **Sends Email 1** immediately via Resend API
5. **Schedules Email 2** for Day 3 via Resend scheduled sends
6. **Schedules Email 3** for Day 7 via Resend scheduled sends
7. Logs all sends to `email_sequence_log`
8. Sends admin notification to `hello@oneyco.com.au`

**Environment Variables**:
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for Supabase
- `RESEND_API_KEY`: API key for Resend email service

**Error Handling**: Idempotent on duplicate emails, graceful fallback for Email 2/3 scheduling

---

### 2. `send-scheduled-emails` (Scheduled Processor)

**Trigger**: Via pg_cron or manual invocation (recommended: every 5-15 minutes)

**Process**:
1. Queries `email_sequence_log` for records with `status='scheduled'` and `sent_at <= now()`
2. Sends each pending email via Resend API
3. Updates records with actual send time, status, Resend message ID
4. Logs any failures

**Returns**: JSON with counts of processed/succeeded/failed emails

**Setup**: Call via cron or HTTP trigger from external scheduler

---

## Setup Instructions

### 1. Deploy Database Migration

```bash
# Apply the Supabase migration
supabase db push --linked
# Runs: migrations/20260405_email_sequence.sql
```

This creates:
- `email_sequence_log` table
- Indexes for performance
- RLS policies for security
- Column extension to `leads` table

### 2. Deploy Edge Functions

**Option A: Using Supabase CLI**

```bash
supabase functions deploy fhc-early-bird --no-verify-jwt
supabase functions deploy send-scheduled-emails --no-verify-jwt
```

**Option B: Manual via Supabase Dashboard**

1. Go to SQL Editor
2. Create new function with provided TypeScript code
3. Set CORS headers appropriately

### 3. Set Environment Variables

In Supabase → Project Settings → Functions:

- `SUPABASE_SERVICE_ROLE_KEY`: [Your service role key]
- `RESEND_API_KEY`: [Your Resend API key from Resend.com]

### 4. Update early-bird.html

Current `early-bird.html` already calls `fhc-early-bird` function. Verify the endpoint:

```javascript
const res = await fetch(SUPABASE_URL + '/functions/v1/fhc-early-bird', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + SUPABASE_KEY
  },
  body: JSON.stringify({ email })
});
```

### 5. Set Up Scheduled Email Sending

**Option A: pg_cron (PostgreSQL native)**

```sql
-- Run every 5 minutes
SELECT cron.schedule('fhc-send-scheduled-emails', '*/5 * * * *',
  'SELECT http_post(''https://<your-project>.supabase.co/functions/v1/send-scheduled-emails'',
    jsonb_build_object(''key'', ''your-service-role-key''),
    ''application/json'')');
```

**Option B: External scheduler (Zapier, Make, n8n)**

- HTTP POST to: `https://<your-project>.supabase.co/functions/v1/send-scheduled-emails`
- Headers: `Authorization: Bearer <service-role-key>`
- Frequency: Every 5-15 minutes recommended

**Option C: Manual cron script**

```bash
curl -X POST https://<project>.supabase.co/functions/v1/send-scheduled-emails \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

---

## Email Template Files

All templates use inline CSS for email client compatibility:

- **email-1-confirmation.html** (1.2 KB)
  - Immediate confirmation after signup
  - Dark theme with green gradient header
  - 3 numbered value propositions

- **email-2-education.html** (2.8 KB)
  - Day 3 educational content
  - Assessment rate explanation with 7.10% highlight
  - 3 myth/reality boxes
  - Purple accent for secondary messaging

- **email-3-value.html** (2.5 KB)
  - Day 7 founder story + conversion
  - Founder avatar placeholder
  - Dual CTAs with grid layout
  - Mobile-responsive button stack

All templates:
- Use `#1A1A2E` dark background
- Use `#2ECC85` green for primary CTAs
- Use `#6B4C9A` purple for secondary elements
- Use `Inter` font stack with fallbacks
- Include unsubscribe placeholder (implement via Resend)

---

## Customization

### Change Email Copy

Edit the corresponding `.html` file. Common customizations:

1. **Update URLs**:
   - `fhc.oneyco.com.au` → your FHC domain
   - `tools.oneyco.com.au` → your tools domain
   - `oneyco.com.au` → your main domain

2. **Update Brand Colors**:
   - Green primary: `#2ECC85` (also used in gradients with `#1FAD73`)
   - Purple accent: `#6B4C9A` (light variant: `#9B59B6`)
   - Dark background: `#1A1A2E`

3. **Update Assessment Rate**:
   - Current: 7.10% (RBA 4.10% + 3% buffer)
   - Update all references if rates change

### Change Send Schedule

In `fhc-early-bird/index-v2.ts`, modify the date calculations:

```typescript
// Change from 3 days to different interval:
const scheduledTime2 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days

// Change from 7 days:
const scheduledTime3 = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
```

### Add More Emails

1. Create new `email-4-*.html`
2. Add email type to migration: `ALTER TABLE email_sequence_log...`
3. Add to `fhc-early-bird/index-v2.ts` function
4. Update `getEmailTemplate()` in `send-scheduled-emails/index.ts`

---

## Monitoring & Analytics

### SQL Queries for Insights

**Total signups**:
```sql
SELECT COUNT(*) FROM leads WHERE source = 'fhc-early-bird';
```

**Email send rates**:
```sql
SELECT sequence_number, status, COUNT(*) as count
FROM email_sequence_log
GROUP BY sequence_number, status
ORDER BY sequence_number;
```

**Failed sends (to retry)**:
```sql
SELECT id, email_address, sequence_number, error_message
FROM email_sequence_log
WHERE status = 'failed'
ORDER BY created_at DESC;
```

**Funnel progression** (email open tracking via Resend webhooks):
```sql
SELECT
  COUNT(DISTINCT CASE WHEN sequence_number = 1 THEN email_address END) as email1_sent,
  COUNT(DISTINCT CASE WHEN sequence_number = 2 THEN email_address END) as email2_sent,
  COUNT(DISTINCT CASE WHEN sequence_number = 3 THEN email_address END) as email3_sent
FROM email_sequence_log
WHERE status IN ('sent', 'scheduled');
```

### Resend Webhooks (Optional)

Configure Resend to POST to your analytics endpoint on:
- `email.sent`
- `email.opened`
- `email.clicked`
- `email.bounced`

---

## Best Practices

1. **Test Before Launch**
   - Send test emails to yourself before going live
   - Check rendering in Gmail, Outlook, Apple Mail
   - Verify all links work

2. **Monitor Deliverability**
   - Check Resend dashboard for bounce/complaint rates
   - Verify DKIM/SPF/DMARC records for `hello@oneyco.com.au`
   - Monitor `error_message` field in `email_sequence_log`

3. **Unsubscribe Handling**
   - All emails should include unsubscribe link (Resend handles this)
   - Set `email_sequence_status = 'unsubscribed'` on leads table when user unsubscribes
   - Check this status before sending future emails

4. **Bounce Handling**
   - Configure Resend webhooks to mark bounced emails
   - Set `email_sequence_status = 'bounced'` on leads table
   - Prevent future sends to bounced addresses

5. **Regular Monitoring**
   - Check `email_sequence_log` for failures daily
   - Review send times to ensure scheduled sends are processing
   - Monitor FHC signup conversion from email clicks

---

## Troubleshooting

**Problem**: Emails not being sent immediately on signup

**Solution**:
- Check `RESEND_API_KEY` is set in Supabase
- Verify `fhc-early-bird` function logs (check Supabase Logs tab)
- Ensure Resend account is active with sufficient credits

**Problem**: Scheduled emails not sending

**Solution**:
- Verify `send-scheduled-emails` function is deployed
- Check that scheduler is calling the function (verify logs)
- Confirm records in `email_sequence_log` have `status='scheduled'`

**Problem**: Emails going to spam

**Solution**:
- Check SPF/DKIM/DMARC records for `hello@oneyco.com.au`
- Reduce all-caps text and excessive exclamation marks
- Test sender reputation at MXToolbox
- Ensure unsubscribe link is present

**Problem**: Links in emails not working

**Solution**:
- Verify URLs don't have trailing spaces
- Ensure `https://` protocol is used
- Check that landing pages are publicly accessible
- Test in multiple email clients

---

## Related Files

- **Early-bird page**: `/sessions/epic-inspiring-pasteur/mnt/clawd/oney-fhc/early-bird.html`
- **Supabase migrations**: `/sessions/epic-inspiring-pasteur/mnt/clawd/supabase/migrations/`
- **Edge functions**: `/sessions/epic-inspiring-pasteur/mnt/clawd/supabase/functions/`

---

## Support

For issues or improvements:
- Check Supabase Function logs for errors
- Review Resend dashboard for API issues
- Verify lead records in `leads` table
- Check email_sequence_log for detailed send history

Built by Oney & Co · "Don't ask AI. Ask Oney."
