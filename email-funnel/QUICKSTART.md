# FHC Email Funnel — Quick Start (30 minutes)

Get the email funnel running in production, fast.

## Before You Start

- [ ] Access to Supabase project (syhwaeloljdswsmqkzrx)
- [ ] Resend.com account with API key
- [ ] Supabase CLI installed locally (`supabase --version`)
- [ ] Ability to add DNS records to your domain

## Step 1: Apply Database Migration (5 min)

```bash
cd /sessions/epic-inspiring-pasteur/mnt/clawd/supabase

# Ensure project is linked
supabase link --project-ref syhwaeloljdswsmqkzrx

# Apply the migration
supabase db push

# Select: 20260405_email_sequence.sql
```

**Verify** in Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'email_sequence_log';
-- Should return: email_sequence_log
```

## Step 2: Configure Resend Domain (10 min)

1. Log in to [Resend.com](https://resend.com)
2. Go to **Domains** → **Add domain**
3. Add: `hello@oneyco.com.au`
4. Copy the DNS records (3 records: DKIM, SPF, DMARC)
5. Add them to your DNS provider (Namecheap, Route53, etc.)
6. Wait 5-30 minutes for verification
7. Return to Resend and verify (green checkmark)

**Get API Key**:
- In Resend dashboard → **API Keys**
- Copy your key (starts with `re_`)

## Step 3: Deploy Edge Functions (10 min)

```bash
cd /sessions/epic-inspiring-pasteur/mnt/clawd/supabase

# Deploy both functions
supabase functions deploy fhc-early-bird --no-verify-jwt
supabase functions deploy send-scheduled-emails --no-verify-jwt

# Verify
supabase functions list
# Should show both functions as "deployed"
```

## Step 4: Set Environment Variables (5 min)

In Supabase dashboard:
1. Go to **Settings** → **Functions**
2. Add environment variable:
   - Key: `RESEND_API_KEY`
   - Value: `re_...` (your API key from Resend)
3. Add another:
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (from Settings → API → service_role)

## Step 5: Test the Funnel (5 min)

Go to `https://fhc.oneyco.com.au/early-bird.html`

1. Submit email: `test+fhc@yourdomain.com`
2. Check Resend dashboard → **Emails**
3. Should see "You're on the list 🎉 — FHC Early Bird"
4. Click the email to verify content

**In Supabase SQL Editor**:
```sql
-- Verify signup created
SELECT * FROM leads WHERE email = 'test+fhc@yourdomain.com';

-- Verify email sequence logged
SELECT * FROM email_sequence_log
WHERE email_address = 'test+fhc@yourdomain.com'
ORDER BY sequence_number;
-- Should show 3 records: Email 1 sent, Email 2 scheduled, Email 3 scheduled
```

## Step 6: Configure Scheduler (5 min)

Choose ONE method to run the scheduler every 5-15 minutes:

### Option A: PostgreSQL pg_cron (Simplest)

In Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule('fhc-send-scheduled-emails', '*/5 * * * *',
  'SELECT http_post(''https://syhwaeloljdswsmqkzrx.supabase.co/functions/v1/send-scheduled-emails'',
    jsonb_build_object(''key'', ''ignored''),
    ''application/json'')');
```

### Option B: External Service (Most Reliable)

Using Zapier / Make / n8n:
1. Create new "Schedule" trigger (every 5 minutes)
2. Add HTTP POST action:
   - URL: `https://syhwaeloljdswsmqkzrx.supabase.co/functions/v1/send-scheduled-emails`
   - Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
   - Method: POST

## Done! 🎉

Your email funnel is now live. Here's what will happen:

1. **User signs up** on early-bird.html
2. **Email 1** sent immediately (confirmation + value)
3. **Email 2** scheduled for Day 3 (education on 7.10% assessment rate)
4. **Email 3** scheduled for Day 7 (founder story + conversion CTAs)

All sends logged in `email_sequence_log` table for analytics.

## Common Issues

### "Email not sending"
- Check Resend domain is verified (green checkmark)
- Check Resend API key is correct in environment variables
- Check Supabase function logs (dashboard → Functions → Logs)

### "Scheduled emails not sending"
- Check scheduler is running (check logs)
- Verify function `send-scheduled-emails` is deployed
- Check `email_sequence_log` for pending records with past `sent_at` time

### "Emails going to spam"
- Verify Resend domain is fully verified with DNS records
- Check email content doesn't have spam triggers
- Test at MXToolbox.com

## Next Steps

1. **Monitor** the funnel (see metrics in README.md)
2. **Adjust** email copy if needed (edit .html files)
3. **Scale** by duplicating sequence for other campaigns
4. **Analyze** conversion rates and open rates

## Support

- Full guide: `README.md`
- Detailed setup: `DEPLOYMENT.md`
- Email strategy: `EMAIL_SEQUENCE.md`
- File reference: `INDEX.md`

---

**You're all set!** The system is running and will handle all email sends automatically.
