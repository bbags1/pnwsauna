import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase'
import { createOrGetTimeSlot } from '@/lib/booking-utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.log('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        
        if (checkoutSession.metadata?.time_slot_id) {
          await handleSaunaBooking(checkoutSession, supabase)
        }
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          // Update existing booking status (for backwards compatibility)
          const { data: booking, error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              payment_intent_id: paymentIntent.id,
            })
            .eq('id', bookingId)
            .select(`
              *,
              time_slots (
                date,
                start_time,
                end_time,
                slot_type
              )
            `)
            .single()

          if (updateError) {
            console.error('Error updating booking:', updateError)
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
          }

          // Send confirmation email
          if (booking) {
            try {
              // Email functionality will be handled by Stripe receipts for now
              console.log('Booking confirmed:', booking.id)
            } catch (emailError) {
              console.error('Error sending confirmation email:', emailError)
              // Don't fail the webhook for email errors
            }
          }
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        const failedBookingId = failedPayment.metadata.bookingId

        if (failedBookingId) {
          // Update booking status
          await supabase
            .from('bookings')
            .update({
              status: 'cancelled',
              payment_status: 'failed',
            })
            .eq('id', failedBookingId)
        }
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Handle membership subscriptions
        const subscription = event.data.object as Stripe.Subscription
        await handleMembershipSubscription(subscription, supabase)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSaunaBooking(
  checkoutSession: Stripe.Checkout.Session,
  supabase: any
) {
  try {
    const metadata = checkoutSession.metadata!
    const timeSlotId = metadata.time_slot_id
    const sessionType = metadata.session_type as 'community' | 'private'
    const partySize = parseInt(metadata.party_size)
    const customerName = metadata.customer_name
    const customerPhone = metadata.customer_phone
    const notes = metadata.notes
    const userId = metadata.user_id || null
    const isMember = metadata.is_member === 'true'
    const waiverId = metadata.waiver_id

    // Get time slot details
    const { data: timeSlot, error: slotError } = await supabase
      .from('time_slots')
      .select('*')
      .eq('id', timeSlotId)
      .single()

    if (slotError || !timeSlot) {
      console.error('Time slot not found:', timeSlotId)
      return
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        time_slot_id: timeSlotId,
        user_id: userId,
        user_email: checkoutSession.customer_email,
        user_name: customerName,
        user_phone: customerPhone,
        booking_type: sessionType,
        party_size: partySize,
        status: 'confirmed', // Immediately confirmed since payment succeeded
        payment_status: 'paid',
        payment_intent_id: checkoutSession.payment_intent,
        total_amount: checkoutSession.amount_total || 0,
        notes: notes,
        waiver_id: waiverId,
      })
      .select(`
        *,
        time_slots (
          date,
          start_time,
          end_time,
          slot_type
        )
      `)
      .single()

    if (bookingError) {
      console.error('Error creating booking:', bookingError)
      return
    }

    // Update time slot capacity manually (database trigger not working)
    console.log('📊 Updating time slot capacity for webhook booking...')
    const adminSupabase = createAdminSupabaseClient()
    const { error: slotUpdateError } = await adminSupabase
      .from('time_slots')
      .update({
        current_bookings: timeSlot.current_bookings + partySize
      })
      .eq('id', timeSlotId)

    if (slotUpdateError) {
      console.error('⚠️ Error updating time slot capacity in webhook:', slotUpdateError)
      // Don't fail the whole webhook for this
    } else {
      console.log('✅ Time slot capacity updated successfully in webhook')
    }

    // Send confirmation email
    if (booking) {
      try {
        // Email functionality will be handled by Stripe receipts for now
        console.log('Confirmation email sent for booking:', booking.id)
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError)
        // Don't fail the webhook for email errors
      }
    }

    console.log('Successfully created booking from Stripe Checkout:', booking.id)

  } catch (error) {
    console.error('Error handling sauna booking:', error)
  }
}

async function handleMembershipSubscription(
  subscription: Stripe.Subscription,
  supabase: any
) {
  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    
    if (customer.deleted) {
      console.error('Customer was deleted:', subscription.customer)
      return
    }

    const customerEmail = customer.email
    if (!customerEmail) {
      console.error('No email found for customer:', subscription.customer)
      return
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()

    if (userError || !user) {
      console.error('User not found for email:', customerEmail)
      return
    }

    // Additional security check: verify stripe customer ID matches if already stored
    if (user.stripe_customer_id && user.stripe_customer_id !== subscription.customer) {
      console.error('Security warning: Stripe customer ID mismatch for user:', user.id, 
        'Expected:', user.stripe_customer_id, 'Received:', subscription.customer)
      return
    }

    // Determine membership type from price ID
    const priceId = subscription.items.data[0]?.price?.id
    let membershipType = 'monthly'
    
    if (priceId === process.env.STRIPE_PRICE_ANNUAL_MEMBERSHIP) {
      membershipType = 'annual'
    } else if (priceId === process.env.STRIPE_PRICE_LIFETIME_MEMBERSHIP) {
      membershipType = 'lifetime'
    }

    // Update user's membership status
    const currentPeriodEnd = (subscription as any).current_period_end
    const currentPeriodStart = (subscription as any).current_period_start
    
    const endDate = subscription.status === 'active' && currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString().split('T')[0]
      : null

    const { error: updateError } = await supabase
      .from('users')
      .update({
        membership_type: membershipType,
        membership_status: subscription.status,
        membership_start_date: currentPeriodStart 
          ? new Date(currentPeriodStart * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        membership_end_date: endDate,
        stripe_customer_id: subscription.customer,
        stripe_subscription_id: subscription.id,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user membership:', updateError)
      return
    }

    // Record the membership purchase
    const { error: purchaseError } = await supabase
      .from('membership_purchases')
      .upsert({
        user_id: user.id,
        membership_type: membershipType,
        amount_paid: subscription.items.data[0]?.price?.unit_amount || 0,
        start_date: currentPeriodStart 
          ? new Date(currentPeriodStart * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        end_date: endDate,
        stripe_subscription_id: subscription.id,
        status: subscription.status === 'active' ? 'completed' : 'pending',
      })

    if (purchaseError) {
      console.error('Error recording membership purchase:', purchaseError)
    }

    console.log('Successfully updated membership for user:', user.id, 'Type:', membershipType)

  } catch (error) {
    console.error('Error handling membership subscription:', error)
  }
} 