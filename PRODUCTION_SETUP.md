# Production Setup Guide

## 🗄️ Supabase Production Setup

### 1. Database Schema Migration
Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Add waiver_text column to store complete waiver content
ALTER TABLE liability_waivers ADD COLUMN IF NOT EXISTS waiver_text TEXT;

-- Update any existing records (if needed)
UPDATE liability_waivers 
SET waiver_text = 'ASSUMPTION OF RISK, WAIVER OF CLAIMS, AND INDEMNITY AGREEMENT

I, the undersigned participant, acknowledge that I am participating in sauna activities at PNW Sauna ("the Facility") which involve inherent risks including but not limited to:

1. RISKS: I understand that sauna use involves exposure to high temperatures, steam, and potential dehydration, which may result in:
   - Heat exhaustion, heat stroke, or dehydration
   - Cardiovascular stress or complications
   - Fainting, dizziness, or disorientation
   - Burns from hot surfaces or steam
   - Slips, falls, or other physical injuries
   - Allergic reactions or respiratory issues

2. MEDICAL CONDITIONS: I certify that I am in good physical condition and have no medical conditions that would prevent my safe participation in sauna activities. I understand that I should consult with a physician before participating if I have any concerns about my health.

3. ASSUMPTION OF RISK: I voluntarily assume all risks associated with sauna use, whether known or unknown, and understand that these activities may result in serious injury or death.

4. WAIVER OF CLAIMS: I hereby waive, release, and discharge PNW Sauna, its owners, operators, employees, and agents from any and all claims, demands, or causes of action arising from my use of the sauna facilities.

5. INDEMNIFICATION: I agree to indemnify and hold harmless PNW Sauna from any claims brought by third parties arising from my participation in sauna activities.

6. EMERGENCY CONTACT: I authorize PNW Sauna to contact emergency services and my emergency contact in case of medical emergency.

I have read this waiver thoroughly, understand its contents, and agree to be bound by its terms.'
WHERE waiver_text IS NULL;
```

### 2. Auth Configuration
- **Site URL**: Set to your production domain (e.g., `https://yourdomain.com`)
- **Redirect URLs**: Add your production domain to allowed redirect URLs
- **Email Settings**: Configure SMTP settings for production emails

### 3. RLS Policies
Verify these policies exist (they should from development):

```sql
-- Check liability_waivers policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'liability_waivers';
```

### 4. Environment Variables
Make sure you have production values for:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 💳 Stripe Production Setup

### 1. Switch to Live Mode
- Go to Stripe Dashboard
- Toggle from "Test mode" to "Live mode" (top right)

### 2. Create Live Products & Prices
```bash
# Run this script with live keys to create production products
STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe-products.js
```

### 3. Update API Keys
Replace test keys with live keys in your environment variables:
- `STRIPE_SECRET_KEY=sk_live_...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`

### 4. Configure Production Webhooks
1. Go to Stripe Dashboard > Webhooks
2. Create endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Business Information
- Complete business profile in Stripe
- Add bank account for payouts
- Set up tax settings if required

## 🌐 Cloudflare Environment Variables

Set these in Cloudflare Pages (Settings > Environment Variables):

### Production Environment:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🧪 Testing Checklist

### Before Going Live:
- [ ] Test booking flow with real payment (small amount)
- [ ] Verify webhooks work on production domain
- [ ] Test waiver signing and storage
- [ ] Test admin dashboard access
- [ ] Test password reset emails
- [ ] Verify email confirmations work
- [ ] Test membership signup flow

### Admin Setup:
1. Set yourself as admin using production API:
```bash
curl -X POST https://yourdomain.com/api/init \
  -H "Content-Type: application/json" \
  -d '{"action": "setup", "adminEmail": "your-email@example.com"}'
```

2. Access admin dashboard: `https://yourdomain.com/admin`

## 🔒 Security Considerations

### Stripe
- Use live keys only on production
- Keep webhook secrets secure
- Monitor for suspicious activity

### Supabase  
- Review RLS policies
- Monitor database access logs
- Set up database backups

### General
- Use HTTPS everywhere
- Regular security updates
- Monitor error logs

## 📧 Email Configuration

### Supabase Email (optional)
Consider setting up custom SMTP in Supabase for:
- Better deliverability
- Custom branding
- Higher sending limits

### Email Templates
Customize email templates in Supabase Auth settings:
- Password reset emails
- Confirmation emails
- Invite emails

## 🚨 Go-Live Checklist

- [ ] Database migration completed
- [ ] Stripe in live mode with products created
- [ ] All environment variables updated
- [ ] Webhooks configured and tested
- [ ] Admin access confirmed
- [ ] Test booking completed
- [ ] Email delivery verified
- [ ] Business information completed in Stripe
- [ ] Bank account added to Stripe
- [ ] Domain SSL certificate active

## 📞 Support Setup

Consider setting up:
- Error monitoring (e.g., Sentry)
- Uptime monitoring
- Customer support contact
- Backup admin accounts 