import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { 
  isSlotAvailable,
  hasActiveMembership,
  getMemberPrice,
  calculateBookingPrice 
} from '@/lib/booking-utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  try {
    const {
      timeSlotId,
      sessionType,
      partySize,
      customerEmail,
      customerName,
      customerPhone,
      notes,
      waiverId
    } = await request.json()

    // Validate required fields
    if (!timeSlotId || !sessionType || !partySize || !customerEmail || !customerName || !waiverId) {
      return NextResponse.json({ error: 'Missing required fields including liability waiver' }, { status: 400 })
    }

    // Get the current user with authentication from headers
    const authHeader = request.headers.get('authorization')
    let supabase
    let user = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      // Create a properly authenticated Supabase client
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )
      
      // Get the authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
      if (!authError && authUser) {
        user = authUser
      }
    } else {
      // Fallback to server client for non-authenticated users
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }

    // Get time slot details
    const { data: timeSlot, error: slotError } = await supabase
      .from('time_slots')
      .select('*')
      .eq('id', timeSlotId)
      .single()

    if (slotError || !timeSlot) {
      return NextResponse.json({ error: 'Time slot not found' }, { status: 404 })
    }

    // Check if slot is still available
    const available = await isSlotAvailable(timeSlot.date, timeSlot.start_time, partySize, sessionType)
    if (!available) {
      return NextResponse.json({ error: 'Time slot is no longer available' }, { status: 400 })
    }

    // Check if user is a member for discounts
    let isMember = false
    let memberDiscount = 0

    if (user) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      console.log('🔍 Retrieved user profile for booking:', {
        id: userProfile?.id,
        email: userProfile?.email,
        membership_type: userProfile?.membership_type,
        membership_status: userProfile?.membership_status,
        membership_start_date: userProfile?.membership_start_date,
        membership_end_date: userProfile?.membership_end_date,
      })

      if (userProfile) {
        isMember = hasActiveMembership(userProfile)
        console.log('✅ Member status check result:', isMember)
        
        // If user is an active member, create booking directly without payment
        if (isMember) {
          console.log('🎉 Creating free member booking...')
          
          try {
            const { data: booking, error: bookingError } = await supabase
              .from('bookings')
              .insert({
                time_slot_id: timeSlotId,
                user_id: user.id,
                user_email: customerEmail,
                user_name: customerName,
                user_phone: customerPhone,
                booking_type: sessionType,
                party_size: partySize,
                status: 'confirmed',
                payment_status: 'paid',
                total_amount: 0,
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
              console.error('❌ Booking creation error:', bookingError)
              return NextResponse.json({ 
                error: 'Failed to create booking: ' + bookingError.message,
                details: bookingError 
              }, { status: 500 })
            }

            console.log('✅ Booking created successfully:', booking.id)

            // Update time slot capacity manually (no database trigger exists)
            console.log('📊 Updating time slot capacity...')
            const adminSupabase = createAdminSupabaseClient()
            const { error: slotUpdateError } = await adminSupabase
              .from('time_slots')
              .update({
                current_bookings: timeSlot.current_bookings + partySize
              })
              .eq('id', timeSlotId)

            if (slotUpdateError) {
              console.error('⚠️ Error updating time slot capacity:', slotUpdateError)
              // Don't fail the whole request for this
            } else {
              console.log('✅ Time slot capacity updated successfully')
            }

            // Return success response for member booking
            console.log('🎉 Returning successful member booking response')
            return NextResponse.json({ 
              success: true,
              memberBooking: true,
              bookingId: booking.id,
              message: 'Booking confirmed! As a member, this reservation is completely free.'
            })
          } catch (error) {
            console.error('💥 Unexpected error in member booking creation:', error)
            return NextResponse.json({ 
              error: 'Unexpected error creating member booking',
              details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 })
          }
        }
      }
    }

    // Calculate pricing
    const basePrice = calculateBookingPrice(sessionType, partySize)
    const finalPrice = isMember ? getMemberPrice(sessionType, partySize) : basePrice
    memberDiscount = basePrice - finalPrice

    // Get Stripe price ID based on session type
    const stripePriceId = sessionType === 'community' 
      ? process.env.STRIPE_PRICE_COMMUNITY_SESSION
      : process.env.STRIPE_PRICE_PRIVATE_SESSION

    if (!stripePriceId) {
      return NextResponse.json({ error: 'Stripe price not configured' }, { status: 500 })
    }

    // Create line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    if (sessionType === 'community') {
      // For community sessions, quantity = party size
      lineItems.push({
        price: stripePriceId,
        quantity: partySize,
      })
    } else {
      // For private sessions, flat rate regardless of party size
      lineItems.push({
        price: stripePriceId,
        quantity: 1,
      })
    }

    // Apply member discount if applicable
    if (isMember && memberDiscount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Member Discount',
            description: `${isMember ? 'Member' : ''} discount applied`,
          },
          unit_amount: -memberDiscount, // Negative amount for discount
        },
        quantity: 1,
      })
    }

    // Format date and time for display
    const sessionDate = new Date(timeSlot.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const sessionTime = new Date(`1970-01-01T${timeSlot.start_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      metadata: {
        time_slot_id: timeSlotId,
        session_type: sessionType,
        party_size: partySize.toString(),
        customer_name: customerName,
        customer_phone: customerPhone || '',
        notes: notes || '',
        user_id: user?.id || '',
        is_member: isMember.toString(),
        member_discount: memberDiscount.toString(),
        session_date: sessionDate,
        session_time: sessionTime,
        slot_date: timeSlot.date,
        slot_start_time: timeSlot.start_time,
        slot_end_time: timeSlot.end_time,
        waiver_id: waiverId,
      },
      payment_intent_data: {
        metadata: {
          time_slot_id: timeSlotId,
          session_type: sessionType,
          party_size: partySize.toString(),
          booking_type: 'sauna_session',
        },
      },
      // Custom appearance
      custom_text: {
        submit: {
          message: `You're booking a ${sessionType} sauna session for ${sessionDate} at ${sessionTime}. Complete payment to confirm your reservation.`
        }
      },
      // Receipt email
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `PNW Sauna - ${sessionType} session on ${sessionDate} at ${sessionTime}`,
          metadata: {
            session_date: timeSlot.date,
            session_time: timeSlot.start_time,
            location: 'Atlas Waterfront Park, Coeur d\'Alene, Idaho'
          },
          custom_fields: [
            {
              name: 'Session Details',
              value: `${sessionType} session for ${partySize} ${partySize === 1 ? 'person' : 'people'}`
            },
            {
              name: 'Location',
              value: 'Atlas Waterfront Park, Coeur d\'Alene, Idaho'
            }
          ]
        }
      }
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      finalPrice,
      memberDiscount,
      isMember,
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 