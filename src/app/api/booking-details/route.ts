import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Retrieve the Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer']
    })

    if (!checkoutSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Extract booking details from metadata
    const metadata = checkoutSession.metadata
    if (!metadata?.time_slot_id) {
      return NextResponse.json({ error: 'Invalid booking session' }, { status: 400 })
    }

    // Format the session details for display
    const sessionDate = metadata.session_date || 'Date not available'
    const sessionTime = metadata.session_time || 'Time not available'
    const sessionType = metadata.session_type || 'Session type not available'
    const partySize = parseInt(metadata.party_size || '1')

    const bookingDetails = {
      sessionId: checkoutSession.id,
      customerEmail: checkoutSession.customer_email,
      amountTotal: checkoutSession.amount_total || 0,
      sessionDate,
      sessionTime,
      sessionType,
      partySize,
      location: 'Atlas Waterfront Park, Coeur d\'Alene, Idaho',
      customerName: metadata.customer_name,
      status: checkoutSession.payment_status
    }

    return NextResponse.json(bookingDetails)

  } catch (error) {
    console.error('Error fetching booking details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    )
  }
} 