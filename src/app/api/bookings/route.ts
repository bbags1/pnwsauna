import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { 
  createOrGetTimeSlot, 
  calculateBookingPrice, 
  getMemberPrice,
  hasActiveMembership,
  isSlotAvailable 
} from '@/lib/booking-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const slotType = searchParams.get('slotType') as 'community' | 'private' | null
    
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from('time_slots')
      .select('*')
      .eq('is_available', true)
      .order('date')
      .order('start_time')
    
    if (date) {
      query = query.eq('date', date)
    }
    
    if (slotType) {
      query = query.eq('slot_type', slotType)
    }
    
    const { data: timeSlots, error } = await query
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(timeSlots)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      date,
      startTime,
      endTime,
      bookingType,
      partySize,
      userEmail,
      userName,
      userPhone,
      notes,
      paymentIntentId,
    } = body
    
    // Validate required fields
    if (!date || !startTime || !endTime || !bookingType || !partySize || !userEmail || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate party size
    if (partySize < 1 || partySize > 8) {
      return NextResponse.json({ error: 'Party size must be between 1 and 8' }, { status: 400 })
    }
    
    const supabase = createServerSupabaseClient()
    
    // Check if slot is available
    const available = await isSlotAvailable(date, startTime, partySize, bookingType)
    if (!available) {
      return NextResponse.json({ error: 'Time slot is not available' }, { status: 400 })
    }
    
    // Get or create the time slot
    const timeSlot = await createOrGetTimeSlot(date, startTime, endTime, bookingType)
    
    // Get user info if they're logged in
    const { data: { user } } = await supabase.auth.getUser()
    let userId = null
    let isMember = false
    
    if (user) {
      userId = user.id
      
      // Check if user has membership
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userProfile) {
        isMember = hasActiveMembership(userProfile)
      }
    }
    
    // Calculate price
    const basePrice = calculateBookingPrice(bookingType, partySize)
    const totalAmount = isMember ? getMemberPrice(bookingType, partySize) : basePrice
    
    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        time_slot_id: timeSlot.id,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        user_phone: userPhone,
        booking_type: bookingType,
        party_size: partySize,
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: paymentIntentId || null,
        total_amount: totalAmount,
        notes: notes,
      })
      .select()
      .single()
    
    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.json({ error: bookingError.message }, { status: 500 })
    }
    
    return NextResponse.json({
      booking,
      totalAmount,
      isMember,
      memberDiscount: isMember ? basePrice - totalAmount : 0,
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// New endpoint to get current availability for a specific slot
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { timeSlotId } = body
    
    if (!timeSlotId) {
      return NextResponse.json({ error: 'Time slot ID required' }, { status: 400 })
    }
    
    const supabase = createServerSupabaseClient()
    
    // Get current availability
    const { data: timeSlot, error } = await supabase
      .from('time_slots')
      .select('*, bookings!inner(party_size)')
      .eq('id', timeSlotId)
      .single()
    
    if (error || !timeSlot) {
      return NextResponse.json({ error: 'Time slot not found' }, { status: 404 })
    }
    
    // Calculate current bookings
    const confirmedBookings = await supabase
      .from('bookings')
      .select('party_size')
      .eq('time_slot_id', timeSlotId)
      .eq('status', 'confirmed')
    
    const totalBooked = confirmedBookings.data?.reduce((sum, booking) => sum + booking.party_size, 0) || 0
    const spotsAvailable = timeSlot.max_capacity - totalBooked
    
    return NextResponse.json({
      spotsAvailable,
      maxCapacity: timeSlot.max_capacity,
      totalBooked,
      isAvailable: spotsAvailable > 0
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 