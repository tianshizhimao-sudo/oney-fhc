# FHC Email Funnel — Complete File Index

## Quick Overview

The FHC Email Funnel is a complete 3-email marketing automation system for Oney & Co's early-bird program. Total deliverable: **7 files** (3,161 lines of code + documentation).

---

## Files by Category

### 1. Email Templates (3 files)

#### `email-1-confirmation.html` (138 lines)
- **Trigger**: Sent immediately on user signup
- **Subject**: "You're on the list 🎉 — FHC Early Bird"
- **Purpose**: Confirmation + value reinforcement
- **Structure**:
  - Green gradient header
  - 3 numbered value propositions
  - Reassurance box (purple accent)
  - Primary CTA: "Learn More About FHC"
- **Key message**: "Early-bird price of $29 AUD locked in"

#### `email-2-education.html` (198 lines)
- **Trigger**: Sent on Day 3 after signup
- **Subject**: "How Banks Really Assess You (It's Not What You Think)"
- **Chinese**: "你知道银行是怎么评估你的吗？"
- **Purpose**: Education on banking assessment, myth-busting
- **Structure**:
  - Assessment rate section (7.10% APRA buffer)
  - Three common myths with realities
  - Bank-Ready Score value prop
  - Primary CTA: "Try the Bank-Ready Score"
- **Key message**: "Banks use 7.10%, not advertised rates"

#### `email-3-value.html` (185 lines)
- **Trigger**: Sent on Day 7 after signup
- **Subject**: "Your First Home — Closer Than You Think"
- **Chinese**: "你的首套房，离你有多远？"
- **Purpose**: Founder story + soft conversion + urgency
- **Structure**:
  - Founder story (Dong's 8 years in banking)
  - FHC value prop section
  - Dual CTAs (side by side):
    - "Get FHC for $29" (primary, green)
    - "Book Free 15-Min Call" (secondary, outline)
  - Urgency box (early-bird closes)
- **Key message**: "Know your real numbers before you apply"

**Template Features** (all 3):
- Inline CSS (email-safe, no external dependencies)
- Responsive design (mobile + desktop)
- Dark theme (#1A1A2E background)
- Brand colors: #2ECC85 (green), #6B4C9A (purple)
- Inter font with fallbacks
- Unsubscribe placeholder (Resend handles this)

---

### 2. Database Schema (1 file)

#### `migrations/20260405_email_sequence.sql` (65 lines)
- **Location**: `/sessions/epic-inspiring-pasteur/mnt/clawd/supabase/migrations/`
- **Type**: PostgreSQL migration
- **Changes**:
  1. Creates `email_sequence_log` table with 10 columns:
     - `id` (uuid, primary key)
     - `lead_id` (foreign key to leads)
     - `email_address` (text)
     - `sequence_number` (1, 2, or 3)
     - `email_type` ('confirmation', 'education', 'value')
     - `subject_line` (text)
     - `sent_at` (timestamptz)
     - `resend_message_id` (text)
     - `status` ('scheduled', 'sent', 'failed', 'bounced')
     - `error_message` (text, nullable)

  2. Creates indexes on:
     - `email_address` (fast lookups)
     - `lead_id` (tracking per lead)
     - `sent_at` (chronological queries)
     - `sequence_number` (funnel stage)

  3. Enables RLS (Row Level Security)

  4. Adds policies for anon inserts/updates

  5. Extends `leads` table with:
     - `email_sequence_status` ('active', 'unsubscribed', 'bounced')

**How to apply**:
```bash
supabase db push
```

---

### 3. Edge Functions (2 files)

#### `functions/fhc-early-bird/index-v2.ts` (425 lines)
- **Location**: `/sessions/epic-inspiring-pasteur/mnt/clawd/supabase/functions/`
- **Type**: Deno/TypeScript Edge Function
- **Trigger**: HTTP POST from early-bird.html form submission
- **Process**:
  1. Validate email format
  2. Check if email already registered (idempotent)
  3. Insert lead into `leads` table with `source='fhc-early-bird'`
  4. **Send Email 1 immediately** via Resend API
  5. **Schedule Email 2** for Day 3 (72 hours)
  6. **Schedule Email 3** for Day 7 (168 hours)
  7. Log all 3 sends to `email_sequence_log`
  8. Send admin notification to `hello@oneyco.com.au`

- **Environment variables**:
  - `SUPABASE_SERVICE_ROLE_KEY`: Supabase secret key
  - `RESEND_API_KEY`: Resend.com API key

- **Error handling**:
  - Idempotent on duplicate emails
  - Graceful fallback if Email 2/3 scheduling fails
  - Returns meaningful error messages

- **Response**:
  ```json
  {"success": true, "leadId": "uuid..."}
  ```

**Improvements over original**:
- Proper email sequence logging
- Better error handling
- Inline email templates (no external files)
- Admin notification included

#### `functions/send-scheduled-emails/index.ts` (460 lines)
- **Location**: `/sessions/epic-inspiring-pasteur/mnt/clawd/supabase/functions/`
- **Type**: Deno/TypeScript Edge Function
- **Trigger**: External scheduler (pg_cron, Zapier, Make, Lambda, etc.)
- **Frequency**: Every 5-15 minutes (recommended)
- **Process**:
  1. Query `email_sequence_log` for records with `status='scheduled'` and `sent_at <= now()`
  2. For each pending email:
     - Fetch email type and build HTML template
     - Send via Resend API
     - Update record with actual send time
     - Update status to 'sent' or 'failed'
     - Log any errors
  3. Return summary (processed count, success, failures)

- **Environment variables**:
  - `SUPABASE_SERVICE_ROLE_KEY`: Supabase secret key
  - `RESEND_API_KEY`: Resend.com API key

- **Response**:
  ```json
  {
    "success": true,
    "processed": 42,
    "successCount": 41,
    "failureCount": 1
  }
  ```

**How to schedule**:
- Option A: PostgreSQL pg_cron (SQL-based)
- Option B: External service (Zapier, Make, n8n)
- Option C: Serverless function (AWS Lambda, Google Cloud Functions)

---

### 4. Documentation (4 files)

#### `README.md` (380 lines)
- **Purpose**: Complete system documentation
- **Contents**:
  - Overview of system architecture
  - Components breakdown (templates, migrations, functions, config)
  - Detailed email breakdown (each email's purpose, content, psychology)
  - Database schema with SQL examples
  - Edge function documentation
  - Setup instructions (5 steps)
  - Monitoring & analytics queries
  - Best practices & troubleshooting
  - Related files reference

**When to read**: First-time users, system overview needed

#### `DEPLOYMENT.md` (480 lines)
- **Purpose**: Step-by-step deployment guide
- **Contents**:
  - Prerequisites checklist
  - Phase 1: Database setup (5 min)
  - Phase 2: Resend configuration (10 min)
  - Phase 3: Edge functions deployment (15 min)
  - Phase 4: Schedule setup (10 min)
  - Phase 5: Testing (20 min)
  - Phase 6: Pre-launch checklist
  - Phase 7: Ongoing monitoring
  - Rollback plan
  - Common issues & solutions
  - Support contacts

**When to read**: Deploying to production

#### `EMAIL_SEQUENCE.md` (480 lines)
- **Purpose**: Email strategy, copy, and psychology
- **Contents**:
  - Timeline overview (Day 0, 3, 7)
  - Email 1 deep dive (metadata, strategy, structure, copy)
  - Email 2 deep dive (why Day 3, CTA strategy)
  - Email 3 deep dive (dual CTAs, soft conversion)
  - Copy principles across all emails
  - Metrics to track (open rates, CTR, conversions)
  - A/B testing ideas
  - Unsubscribe & bounce handling
  - Common Q&A from recipients
  - Next sequences to build (post-purchase, re-engagement, referral)

**When to read**: Understanding strategy, editing copy, analyzing performance

#### `SUMMARY.md` (280 lines)
- **Purpose**: Quick overview and reference
- **Contents**:
  - What was built (summary)
  - Files created (list with sizes)
  - How it works (4-step flow)
  - Key features (checkmarks)
  - Technology stack
  - Deployment (quick summary)
  - Expected performance metrics
  - What happens if something breaks
  - Files map (directory structure)
  - Next steps (action items)
  - Success criteria

**When to read**: Quick reference, onboarding new team members

#### `INDEX.md` (This file)
- **Purpose**: Complete file reference and documentation index
- **Contents**: File-by-file breakdown with line counts and purpose

**When to read**: Finding specific files, understanding structure

---

## Quick Reference

### By Task

**I want to...**
- **Understand the system** → Read `README.md`
- **Deploy to production** → Read `DEPLOYMENT.md`
- **Change email copy** → Edit `.html` files or read `EMAIL_SEQUENCE.md`
- **Configure scheduler** → See `DEPLOYMENT.md` Phase 4
- **Debug a problem** → See `README.md` troubleshooting or `DEPLOYMENT.md` issues
- **Check what's deployed** → Run `supabase functions list`
- **Monitor performance** → Use SQL queries in `README.md`
- **Quick overview** → Read `SUMMARY.md`

### By File Type

**HTML Templates** (responsive, inline CSS, mobile-safe):
- `email-1-confirmation.html`
- `email-2-education.html`
- `email-3-value.html`

**Database**:
- `migrations/20260405_email_sequence.sql`

**Code** (Deno/TypeScript):
- `functions/fhc-early-bird/index-v2.ts` (signup trigger)
- `functions/send-scheduled-emails/index.ts` (scheduler)

**Documentation**:
- `README.md` (full reference)
- `DEPLOYMENT.md` (setup guide)
- `EMAIL_SEQUENCE.md` (strategy + copy)
- `SUMMARY.md` (quick overview)
- `INDEX.md` (this file)

---

## Key Statistics

| Metric | Value |
|--------|-------|
| Total files | 10 |
| Total lines | 3,161+ |
| HTML files | 3 |
| Documentation files | 5 |
| SQL migration | 1 |
| TypeScript functions | 2 |
| Average email template | 140 lines |
| Average documentation | 320 lines |
| Emails in sequence | 3 |
| Sequence duration | 7 days |
| Lead time: Email 1→2 | 3 days |
| Lead time: Email 2→3 | 4 days |

---

## Deployment Checklist

```
Phase 1: Database
  [ ] Run: supabase db push
  [ ] Verify: SELECT * FROM email_sequence_log LIMIT 1;

Phase 2: Resend Setup
  [ ] Get API key from Resend dashboard
  [ ] Verify domain: hello@oneyco.com.au (add DNS records)
  [ ] Test with test domain verification

Phase 3: Edge Functions
  [ ] Deploy: supabase functions deploy fhc-early-bird
  [ ] Deploy: supabase functions deploy send-scheduled-emails
  [ ] Set environment variables in Supabase dashboard

Phase 4: Scheduling
  [ ] Configure scheduler (pg_cron or external)
  [ ] Test with curl command

Phase 5: Testing
  [ ] Sign up with test email
  [ ] Verify Email 1 received in inbox
  [ ] Check Supabase logs for errors
  [ ] Verify database records created

Phase 6: Pre-launch
  [ ] All checklist items from DEPLOYMENT.md completed

Phase 7: Launch
  [ ] Monitor first 24 hours
  [ ] Set up daily monitoring
  [ ] Configure bounce handling
```

---

## Support Reference

### Resend Setup Issues
- Domain verification: Check DNS records, wait 30-60 minutes
- Email format: Ensure DKIM/SPF/DMARC are configured
- API key: Copy full key (starts with `re_`)

### Supabase Setup Issues
- Service role key: Settings → API → service_role
- Function deployment: `supabase functions deploy [name] --no-verify-jwt`
- Environment variables: Project Settings → Functions

### Email Scheduling Issues
- Check `send-scheduled-emails` logs in Supabase dashboard
- Verify scheduler is calling the function every 5-15 minutes
- Check `sent_at` timestamp in `email_sequence_log` (should be past time)

### Troubleshooting Queries

```sql
-- Check for failed sends
SELECT * FROM email_sequence_log WHERE status = 'failed';

-- Check funnel progression
SELECT sequence_number, COUNT(*) FROM email_sequence_log GROUP BY 1;

-- Check for bounces
SELECT * FROM leads WHERE email_sequence_status = 'bounced';

-- Check scheduled emails waiting to send
SELECT * FROM email_sequence_log
WHERE status = 'scheduled' AND sent_at <= now();
```

---

## File Locations (Absolute Paths)

```
/sessions/epic-inspiring-pasteur/mnt/clawd/
├── oney-fhc/
│   ├── early-bird.html                    (existing signup page)
│   └── email-funnel/
│       ├── email-1-confirmation.html      (138 lines)
│       ├── email-2-education.html         (198 lines)
│       ├── email-3-value.html             (185 lines)
│       ├── README.md                      (380 lines)
│       ├── DEPLOYMENT.md                  (480 lines)
│       ├── EMAIL_SEQUENCE.md              (480 lines)
│       ├── SUMMARY.md                     (280 lines)
│       └── INDEX.md                       (this file)
└── supabase/
    ├── migrations/
    │   └── 20260405_email_sequence.sql   (65 lines)
    └── functions/
        ├── fhc-early-bird/
        │   ├── index.ts                   (existing)
        │   └── index-v2.ts                (425 lines — NEW)
        └── send-scheduled-emails/
            └── index.ts                   (460 lines — NEW)
```

---

## Next: Getting Started

1. **Read** `SUMMARY.md` (5 min) for quick overview
2. **Review** email templates (email-*.html) to check copy
3. **Follow** `DEPLOYMENT.md` step-by-step to deploy
4. **Reference** `README.md` for ongoing questions
5. **Use** `EMAIL_SEQUENCE.md` to understand strategy

## Version Info

- **Version**: 1.0
- **Created**: 2026-04-05
- **Status**: Ready for production deployment
- **Brand**: Oney & Co — "Don't ask AI. Ask Oney."
- **Founder**: Dong M (8+ years Big 4 banking experience)

---

**Built by**: Anthropic Claude
**For**: Oney & Co FHC Early-Bird Program
**Purpose**: Automated 3-email marketing funnel for lead nurturing
