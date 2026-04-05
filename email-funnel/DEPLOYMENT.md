# Email Funnel Deployment Guide

Step-by-step instructions for deploying the FHC email funnel to production.

## Prerequisites

- Supabase project set up (fhc.oneyco.com.au)
- Resend account with API key (resend.com)
- Supabase CLI installed locally
- Access to domain DNS for email verification

## Phase 1: Database Setup (5 minutes)

### 1.1 Apply Migration

```bash
cd /sessions/epic-inspiring-pasteur/mnt/clawd/supabase

# Link to your Supabase project (if not already linked)
supabase link --project-ref syhwaeloljdswsmqkzrx

# Apply the email sequence migration
supabase db push
# Selects: 20260405_email_sequence.sql
```

**What this does**:
- Creates `email_sequence_log` table
- Adds indexes for email_address, lead_id, sent_at, sequence_number
- Adds `email_sequence_status` column to `leads` table
- Enables RLS with insert/update policies

**Verify**:
```sql
-- In Supabase SQL Editor
SELECT * FROM email_sequence_log LIMIT 1;
SELECT email_sequence_status FROM leads LIMIT 1;
```

---

## Phase 2: Resend Configuration (10 minutes)

### 2.1 Get API Key

1. Log in to [Resend.com](https://resend.com)
2. Go to API Keys
3. Create new API key (or use existing)
4. Copy the full key (starts with `re_`)

### 2.2 Verify Sender Domain

1. In Resend dashboard, go to Domains
2. Add domain: `hello@oneyco.com.au`
3. Resend generates DNS records for:
   - DKIM
   - SPF
   - DMARC
4. Add these records to your DNS provider (e.g., Namecheap, AWS Route53)
5. Wait for verification (usually 5-30 minutes)
6. Verify in Resend dashboard

**Important**: Email won't send from `hello@oneyco.com.au` until domain is verified

### 2.3 Enable Webhooks (Optional but Recommended)

For bounce tracking and analytics:

1. In Resend dashboard, go to Webhooks
2. Add webhook:
   - URL: `https://<your-project>.supabase.co/functions/v1/email-webhook` (create this later if needed)
   - Events: `email.sent`, `email.bounced`, `email.complained`
3. Save webhook signing secret for verification

---

## Phase 3: Edge Functions Deployment (15 minutes)

### 3.1 Deploy Main Function (fhc-early-bird)

```bash
cd /sessions/epic-inspiring-pasteur/mnt/clawd/supabase

# Deploy the early-bird funnel trigger
supabase functions deploy fhc-early-bird --no-verify-jwt

# Verify deployment
supabase functions list
```

### 3.2 Deploy Scheduled Processor (send-scheduled-emails)

```bash
# Deploy the scheduled email sender
supabase functions deploy send-scheduled-emails --no-verify-jwt

# Verify deployment
supabase functions list
# Should show both functions as deployed
```

### 3.3 Set Environment Variables

In Supabase dashboard:
1. Go to Project Settings → Functions
2. Set secrets:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [Your service role key from Settings → API]
   - Key: `RESEND_API_KEY`
   - Value: `re_...` [Your Resend API key]
3. Save

**How to get Service Role Key**:
- Supabase dashboard → Settings → API
- Copy `service_role` key under "Project API keys"

### 3.4 Test Functions Manually

```bash
# Test the main funnel function
curl -X POST https://syhwaeloljdswsmqkzrx.supabase.co/functions/v1/fhc-early-bird \
  -H "Authorization: Bearer $(supabase functions list-jwt --local)" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Should return:
# {"success": true, "leadId": "uuid..."}

# Test the scheduled processor
curl -X POST https://syhwaeloljdswsmqkzrx.supabase.co/functions/v1/send-scheduled-emails \
  -H "Authorization: Bearer $(supabase functions list-jwt --local)" \
  -H "Content-Type: application/json"

# Should return:
# {"success": true, "processed": 0, "successCount": 0, "failureCount": 0}
```

---

## Phase 4: Schedule Setup (10 minutes)

Choose one method to run `send-scheduled-emails` every 5-15 minutes:

### Option A: PostgreSQL pg_cron (Recommended)

```sql
-- In Supabase SQL Editor
-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the function to run every 5 minutes
SELECT cron.schedule('fhc-send-scheduled-emails', '*/5 * * * *',
  'SELECT http_post(''https://syhwaeloljdswsmqkzrx.supabase.co/functions/v1/send-scheduled-emails'',
    jsonb_build_object(''authorization'', ''Bearer <YOUR_SERVICE_ROLE_KEY>''),
    ''application/json'')');

-- List scheduled jobs
SELECT * FROM cron.job;

-- Unschedule if needed
SELECT cron.unschedule('fhc-send-scheduled-emails');
```

### Option B: External Service (Make / Zapier / n8n)

1. Create new automation/zap/workflow
2. Trigger: Scheduled (Every 5 minutes)
3. Action: HTTP request
   - Method: POST
   - URL: `https://syhwaeloljdswsmqkzrx.supabase.co/functions/v1/send-scheduled-emails`
   - Headers:
     - `Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>`
     - `Content-Type: application/json`

### Option C: AWS Lambda / Cloud Functions

Use your preferred serverless platform with cron schedule

---

## Phase 5: Testing (20 minutes)

### 5.1 End-to-End Test

1. Go to `https://fhc.oneyco.com.au/early-bird.html`
2. Submit test email: `test-fhc@yourdomain.com`
3. Check Resend dashboard for Email 1 sent
4. Check Supabase `leads` table for new record
5. Check `email_sequence_log` for 3 records:
   - Email 1: `status='sent'`
   - Email 2: `status='scheduled'`, `sent_at` = tomorrow + 3 days
   - Email 3: `status='scheduled'`, `sent_at` = tomorrow + 7 days

### 5.2 Check Test Email

Verify Email 1 appears in inbox:
- Subject: "You're on the list 🎉 — FHC Early Bird"
- Sender: "Oney & Co <hello@oneyco.com.au>"
- Links working
- Images loading
- Formatting intact

### 5.3 Simulate Scheduled Send

**Test Email 2 (Day 3) locally**:

```bash
# Manually trigger the scheduled processor
curl -X POST https://syhwaeloljdswsmqkzrx.supabase.co/functions/v1/send-scheduled-emails \
  -H "Authorization: Bearer <YOUR_SERVICE_ROLE_KEY>" \
  -H "Content-Type: application/json"

# Won't send Email 2 yet because sent_at is 3 days in future
# Response: {"success": true, "processed": 0, "successCount": 0, "failureCount": 0}
```

**Force send test** (for testing only):

```sql
-- Manually update Email 2 sent_at to past time
UPDATE email_sequence_log
SET sent_at = NOW() - INTERVAL '1 day'
WHERE sequence_number = 2
  AND email_address = 'test-fhc@yourdomain.com';

-- Now run scheduled processor again - it should send Email 2
```

### 5.4 Verify Email Templates

Check all 3 emails render correctly in:
- Gmail
- Outlook
- Apple Mail
- Mobile (iPhone/Android)

Common issues to check:
- Dark theme background visible
- Green gradient header displays
- All links clickable
- No broken images
- CTA buttons are clear
- Mobile responsiveness on small screens

---

## Phase 6: Pre-Launch Checklist (5 minutes)

- [ ] Database migration applied (`email_sequence_log` table exists)
- [ ] Resend domain verified (DNS records confirmed)
- [ ] Environment variables set (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Both edge functions deployed (fhc-early-bird, send-scheduled-emails)
- [ ] Scheduled processor configured to run every 5-15 minutes
- [ ] End-to-end test completed (test email received, database records created)
- [ ] Email templates verified in multiple clients
- [ ] All links in emails are correct
- [ ] Sender address is verified with Resend
- [ ] Analytics/monitoring plan in place

---

## Phase 7: Launch & Monitoring (Ongoing)

### 7.1 Monitor First 24 Hours

```sql
-- Check for errors
SELECT * FROM email_sequence_log
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Monitor send rate
SELECT
  DATE(sent_at) as date,
  sequence_number,
  status,
  COUNT(*) as count
FROM email_sequence_log
GROUP BY DATE(sent_at), sequence_number, status
ORDER BY date DESC, sequence_number;

-- Check for bounces (after Resend webhooks are implemented)
SELECT * FROM leads
WHERE email_sequence_status = 'bounced'
ORDER BY updated_at DESC;
```

### 7.2 Daily Monitoring

1. Check Supabase Function logs for errors
2. Review Resend dashboard for bounce/complaint rates
3. Monitor `email_sequence_log` for failed sends
4. Check conversion rate: Email sends → FHC purchases

### 7.3 Ongoing Maintenance

- Review bounce list weekly, remove invalid addresses
- Monitor delivery rates, adjust if declining
- Analyze open/click rates if Resend webhooks enabled
- Test reply-to address (should be `hello@oneyco.com.au`)
- Update email copy if needed (A/B test different versions)

---

## Rollback Plan

If something goes wrong:

### Quick Disable
```bash
# Disable the scheduled processor
supabase functions delete send-scheduled-emails

# Manually reschedule later if needed
supabase functions deploy send-scheduled-emails
```

### Pause New Signups
```bash
# Temporarily disable early-bird page
# Or modify early-bird.html to show "Coming soon" instead of form
```

### Check Logs
```bash
# Supabase → Functions → Logs tab
# See what failed and why
```

### Database Rollback
```bash
# Revert migration if needed
supabase db reset  # WARNING: deletes all data

# Or manually delete records:
DELETE FROM email_sequence_log WHERE created_at > '2026-04-05';
DELETE FROM leads WHERE source = 'fhc-early-bird';
```

---

## Common Issues & Solutions

### "Email not sending from hello@oneyco.com.au"

**Problem**: Resend returns `From address is not verified`

**Solution**:
1. Go to Resend dashboard → Domains
2. Verify `hello@oneyco.com.au` is verified (checkmark visible)
3. Check DNS records were added correctly
4. Wait 30-60 minutes for DNS propagation

### "Scheduled emails not sending"

**Problem**: Email 2/3 showing `status='scheduled'` but not sent

**Solution**:
1. Verify `send-scheduled-emails` function is deployed
2. Verify scheduler is running (check logs)
3. Check `sent_at` timestamp in `email_sequence_log` (should be <= now())
4. Manually trigger processor via curl to test
5. Check Supabase Function logs for errors

### "Early-bird function returns 500 error"

**Problem**: User submits email, gets error response

**Solution**:
1. Check Supabase Function logs (Functions tab → Logs)
2. Verify `RESEND_API_KEY` is set correctly
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
4. Check that `leads` table exists
5. Test function locally with curl
6. Check Resend account has available credits

### "Emails going to spam"

**Problem**: Emails arrive in spam folder instead of inbox

**Solution**:
1. Add SPF/DKIM/DMARC records to DNS (Resend provides these)
2. Check email content for spam triggers:
   - Excessive capitalization
   - Too many exclamation marks
   - Suspicious links
   - Missing unsubscribe link
3. Test sender reputation at MXToolbox.com
4. Check Resend dashboard for complaint rate

---

## Support Contacts

- **Resend Support**: support@resend.com
- **Supabase Support**: https://supabase.com/support
- **Oney & Co**: hello@oneyco.com.au

---

## Next Steps After Launch

1. **Monitor conversion funnel**
   - Track Email 1 → Email 2 → Email 3 completion rates
   - Monitor click-through rates to FHC
   - Track FHC purchase rate by funnel stage

2. **A/B testing**
   - Test different subject lines
   - Test different CTA button text
   - Test send times

3. **Expand funnel**
   - Add Email 4 (14-day re-engagement)
   - Add Email 5 (abandoned cart / one last chance)
   - Segment sequences by user behavior

4. **Analytics dashboard**
   - Create Supabase dashboard with funnel metrics
   - Integrate with your CRM
   - Set up automated alerts for high bounce rates

---

Deployment Version: 1.0
Last Updated: 2026-04-05
