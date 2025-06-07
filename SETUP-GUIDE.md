# PNW Sauna Booking System Setup Guide 🧊♨️

Your complete Finnish sauna booking platform with payment processing, email confirmations, and membership management!

## ✅ What's Implemented

### 🎯 Core Features
- **Guest & Authenticated Bookings** - Anyone can book without creating an account
- **Real-time Availability Tracking** - Shows current spots available/booked
- **Payment Processing** - Secure Stripe integration
- **Email Confirmations** - Automated booking confirmations via Resend
- **Membership System** - Monthly/Annual/Lifetime memberships with discounts
- **User Authentication** - Sign up, sign in, Google OAuth
- **Admin Dashboard** - Manage bookings and time slots

### 💳 Payment & Email Flow
1. User selects time slot and fills booking form
2. Booking created in "pending" status
3. User completes Stripe payment
4. Webhook confirms payment → booking status = "confirmed"
5. Automatic email confirmation sent
6. Real-time availability updates

## 🔧 Setup Instructions

### 1. Database Setup (REQUIRED)
Apply the RLS policy fix in your Supabase SQL Editor:

```sql
-- Fix RLS policies to allow guest bookings
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Anyone can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);

-- Add membership functionality
CREATE TABLE public.membership_purchases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    membership_type membership_type NOT NULL,
    amount_paid INTEGER NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    payment_intent_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.membership_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own membership purchases" ON public.membership_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own membership purchases" ON public.membership_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.membership_purchases TO anon, authenticated;
```

### 2. Environment Variables
Create `.env.local` with these values:

```bash
# Supabase (you already have these)
NEXT_PUBLIC_SUPABASE_URL=https://lavbggcznunkqtbstetu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_existing_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_existing_service_role_key

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (get after setting up webhook)

# Email (get from https://resend.com/api-keys)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Stripe Setup
1. Create account at https://dashboard.stripe.com
2. Get test API keys from Dashboard → Developers → API Keys
3. Set up webhook endpoint:
   - Endpoint URL: `http://localhost:3000/api/stripe-webhook` (or your domain)
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook signing secret

### 4. Email Setup (Resend)
1. Create account at https://resend.com
2. Get API key from dashboard
3. Verify your sending domain (or use resend's sandbox for testing)

### 5. Replace Current Booking Page
Replace your current booking page with the new payment-enabled version:

```bash
# Backup current page
mv src/app/book/page.tsx src/app/book/page-backup.tsx

# Use new page with payments
mv src/app/book/page-with-payment.tsx src/app/book/page.tsx
```

### 6. Test the System
1. Start development server: `npm run dev`
2. Visit: `http://localhost:3000/book`
3. Book a time slot
4. Complete payment with test card: `4242 4242 4242 4242`
5. Check email for confirmation

## 🎯 Key Features Explained

### Real-Time Availability
- **Shows live spot counts** in time slot grid
- **Prevents overbooking** with database triggers
- **Updates immediately** after successful payments

### Payment Flow
```mermaid
graph TD
    A[Select Time Slot] --> B[Fill Booking Form]
    B --> C[Create Booking (pending)]
    C --> D[Stripe Payment Form]
    D --> E[Payment Success]
    E --> F[Webhook Updates Status]
    F --> G[Email Confirmation Sent]
    G --> H[Availability Updated]
```

### Membership Benefits
- **Monthly ($59)**: 20% off private sessions
- **Annual ($599)**: 30% off private sessions + guest passes
- **Lifetime ($1999)**: 50% off private sessions + unlimited guests

### Email Templates
Beautiful HTML emails include:
- Booking confirmation details
- What to bring instructions
- Location information
- Contact details

## 🚀 Going Live

### 1. Production Environment Variables
```bash
# Supabase (production)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Stripe (live keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# Resend (production domain)
RESEND_API_KEY=re_...
```

### 2. Domain Setup
- Set up your domain (e.g., `pnwsauna.com`)
- Update webhook URLs in Stripe
- Verify email domain in Resend

### 3. Security Checklist
- [ ] All API keys secured
- [ ] Webhook endpoints verified
- [ ] RLS policies tested
- [ ] SSL certificate active
- [ ] CORS configured

## 📱 Features Overview

### For Guests
- Browse available time slots
- Book without creating account
- Secure payment processing
- Email confirmations
- Session reminders

### For Members
- Automatic discounts applied
- Priority booking access
- Member-only time slots
- Guest pass benefits

### For Admins
- Manage all bookings
- Generate time slots
- View payment status
- Send manual emails
- Member management

## 🛠 API Endpoints

- `GET /api/time-slots` - Get available slots
- `POST /api/bookings` - Create booking
- `POST /api/create-payment-intent` - Initialize payment
- `POST /api/stripe-webhook` - Handle payment confirmations
- `GET /membership` - Membership signup page

## 🎉 You're Ready!

Your PNW Sauna booking system now includes:
✅ Guest bookings  
✅ Real-time availability  
✅ Secure payments  
✅ Email confirmations  
✅ Membership system  
✅ User authentication  
✅ Professional UI/UX  

The system is production-ready for your authentic Finnish sauna experience at Atlas Waterfront Park in Coeur d'Alene, Idaho! 🧊🔥 