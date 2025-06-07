# PNW Sauna: Stripe Platform Approach 🧊♨️

## Overview: Rebuilding with Maximum Stripe Integration

Instead of a fully custom booking system, you can leverage Stripe's platform features for 80% of the functionality while keeping only the essential booking logic custom.

## 🎯 What Changes

### **Current Custom System:**
- Custom payment forms with Stripe Elements
- Custom booking creation API
- Custom email system
- Custom membership management
- Custom user authentication

### **New Stripe-Heavy System:**
- **Stripe Checkout** for payments (hosted by Stripe)
- **Stripe Products** for sauna sessions
- **Stripe Prices** for different session types
- **Stripe Customers** for user management
- **Stripe Billing** for memberships
- **Stripe Customer Portal** for self-service
- Only keep: time slot management + availability tracking

---

## 🏗️ Implementation Plan

### Phase 1: Stripe Products Setup

```javascript
// Create products in Stripe Dashboard or via API
const products = {
  community_session: {
    name: "Community Sauna Session",
    description: "Shared authentic Finnish sauna experience",
    default_price_data: {
      currency: 'usd',
      unit_amount: 2500, // $25
      recurring: null
    }
  },
  private_session: {
    name: "Private Sauna Session", 
    description: "Exclusive sauna experience for up to 8 people",
    default_price_data: {
      currency: 'usd',
      unit_amount: 20000, // $200
      recurring: null
    }
  },
  monthly_membership: {
    name: "Monthly Membership",
    description: "30 days unlimited access + discounts",
    default_price_data: {
      currency: 'usd',
      unit_amount: 5900, // $59
      recurring: {
        interval: 'month'
      }
    }
  }
}
```

### Phase 2: Stripe Checkout Integration

Replace your custom payment flow with hosted Stripe Checkout:

```javascript
// New booking API - creates Stripe Checkout Session
export async function POST(request: NextRequest) {
  const { timeSlotId, sessionType, partySize, customerEmail } = await request.json()
  
  // Get time slot details
  const timeSlot = await getTimeSlot(timeSlotId)
  
  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    line_items: [{
      price: sessionType === 'community' ? 'price_community' : 'price_private',
      quantity: sessionType === 'community' ? partySize : 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
    metadata: {
      time_slot_id: timeSlotId,
      session_type: sessionType,
      party_size: partySize.toString(),
    },
    expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 min expiry
  })
  
  return NextResponse.json({ checkoutUrl: session.url })
}
```

### Phase 3: Simplified Frontend

```jsx
// Much simpler booking component
function BookingFlow({ timeSlot }) {
  const [loading, setLoading] = useState(false)
  
  const handleBooking = async (formData) => {
    setLoading(true)
    
    // Create checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeSlotId: timeSlot.id,
        sessionType: formData.sessionType,
        partySize: formData.partySize,
        customerEmail: formData.email,
      }),
    })
    
    const { checkoutUrl } = await response.json()
    
    // Redirect to Stripe Checkout (no custom payment form!)
    window.location.href = checkoutUrl
  }
  
  return (
    <form onSubmit={handleBooking}>
      {/* Just collect basic info - Stripe handles payment */}
      <input name="email" type="email" required />
      <select name="sessionType">
        <option value="community">Community ($25/person)</option>
        <option value="private">Private ($200)</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Session...' : 'Book & Pay with Stripe'}
      </button>
    </form>
  )
}
```

### Phase 4: Membership with Stripe Billing

```javascript
// Membership signup becomes much simpler
const createMembershipCheckout = async (membershipType) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      price: membershipType === 'monthly' ? 'price_monthly_membership' : 'price_annual_membership',
      quantity: 1,
    }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership-success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership`,
  })
  
  return session.url
}
```

---

## 🚀 Option 2: Full Stripe Platform (95% Stripe)

For maximum simplification, you could use existing Stripe-integrated booking platforms:

### **Ready-Made Solutions:**
1. **Calendly + Stripe** - $10/month + Stripe fees
2. **Acuity Scheduling** - $16/month + Stripe fees  
3. **Setmore** - $5/month + Stripe fees
4. **Google Calendar + Stripe** - $10.80/month + Stripe fees

### **Pros:**
- Zero custom development
- Built-in calendar management
- Automatic email confirmations
- Customer self-service
- Mobile apps included
- Professional booking pages

### **Cons:**
- Less customization for your brand
- Monthly subscription costs
- Limited control over user experience
- May not perfectly fit sauna-specific needs

---

## 🤔 Recommendation for PNW Sauna

### **Best Approach: Stripe-Heavy Hybrid**

Keep your current custom time slot management (you've already built this well) but replace everything else with Stripe:

```
Custom:                    Stripe Platform:
✓ Time slot creation       ✓ Payment processing  
✓ Availability tracking    ✓ Customer management
✓ Calendar interface       ✓ Membership billing
                          ✓ Email receipts
                          ✓ Refund handling
                          ✓ Customer portal
```

### **Implementation Steps:**

1. **Week 1:** Set up Stripe Products for your sauna sessions
2. **Week 2:** Replace payment forms with Stripe Checkout
3. **Week 3:** Migrate memberships to Stripe Billing
4. **Week 4:** Set up Stripe Customer Portal

### **Benefits:**
- **Reduce code by 60%** - Less maintenance burden
- **Better security** - Stripe handles PCI compliance
- **Professional UX** - Stripe's polished checkout experience
- **Global payments** - 135+ currencies out of the box
- **Customer self-service** - Stripe portal for booking management
- **Lower costs** - No separate email service needed

### **What You Keep:**
- Your beautiful time slot interface
- Real-time availability tracking  
- Custom booking calendar
- Sauna-specific business logic

---

## 💰 Cost Comparison

### Current Custom System:
- Stripe: 2.9% + 30¢ per transaction
- Resend: $20/month for emails
- Supabase: $25/month for database
- **Total: ~3.1% + $45/month**

### Stripe-Heavy System:
- Stripe: 2.9% + 30¢ per transaction (same)
- No separate email service (Stripe includes receipts)
- Supabase: $25/month (still need for time slots)
- **Total: ~2.9% + $25/month**

**You'd save ~$20/month and reduce complexity by 60%!**

---

## 🎯 Quick Start

Want to try this approach? I can help you:

1. **Set up Stripe Products** for your sauna sessions
2. **Create Stripe Checkout integration** to replace payment forms
3. **Migrate membership system** to Stripe Billing
4. **Keep your existing** time slot and calendar logic

This gives you the best of both worlds: the power of Stripe's platform with the custom booking experience your customers love.

Would you like me to start implementing the Stripe-heavy approach? 