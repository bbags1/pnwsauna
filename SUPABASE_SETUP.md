# Supabase Booking System Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized

## 2. Environment Variables

Create a `.env.local` file with your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Stripe Configuration (for future payment integration)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Optional: Email Configuration
RESEND_API_KEY=your_resend_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Run Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the entire contents of `supabase/schema.sql`
3. Click "Run" to execute all the SQL commands

This will create:
- User profiles table
- Time slots table
- Bookings table
- All necessary triggers and functions
- Row Level Security policies

## 4. Configure Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Enable the providers you want (Email, Google, etc.)
3. Set Site URL to your domain (for local dev: `http://localhost:3000`)
4. Add redirect URLs if needed

## 5. Initialize the System

After setting up your database and environment variables:

1. Start your development server: `npm run dev`
2. Create a user account through the signup process
3. Run the initialization endpoint:

```bash
curl -X POST http://localhost:3000/api/init \
  -H "Content-Type: application/json" \
  -d '{"action": "setup", "adminEmail": "your@email.com"}'
```

This will:
- Generate time slots for the next 30 days
- Make your user account an admin

## 6. Access Admin Dashboard

1. Sign in with your admin account
2. Visit `/admin` to access the admin dashboard
3. You can view bookings and manage time slots

## 7. Test the Booking System

1. Visit `/book` to test the booking interface
2. Select a date and time slot
3. Fill out the booking form
4. Check the admin dashboard to see the booking

## 8. Deploy to Cloudflare Pages

This system is designed to work with Cloudflare Pages:

1. Push your code to GitHub
2. Connect your repository to Cloudflare Pages
3. Set your environment variables in Cloudflare Pages dashboard
4. The site will automatically deploy and work with Supabase

## Features Included

### User Features:
- ✅ Calendar-based booking interface
- ✅ Community sessions (8 people max, $25/person)
- ✅ Private sessions (exclusive use, $200 flat rate)
- ✅ Real-time availability checking
- ✅ Booking confirmation
- ✅ User account creation

### Admin Features:
- ✅ View all bookings
- ✅ Confirm/cancel bookings
- ✅ Generate time slots
- ✅ View time slot capacity
- ✅ Revenue tracking

### Technical Features:
- ✅ PostgreSQL database with triggers
- ✅ Row Level Security
- ✅ Real-time updates
- ✅ Capacity management
- ✅ Conflict prevention
- ✅ Mobile responsive design

## Time Slot Configuration

Current schedule:
- **Community Sessions**: 6-9am, 7-11pm (8 people max)
- **Private Sessions**: 7am-10pm (exclusive use)

To modify these times, edit the constants in `src/lib/booking-utils.ts`:
- `COMMUNITY_HOURS`
- `PRIVATE_HOURS`

## Pricing Configuration

Current pricing:
- Community: $25 per person
- Private: $200 per session

To modify pricing, edit the `PRICING` object in `src/lib/booking-utils.ts`.

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify environment variables are set correctly
4. Ensure the database schema was applied successfully 