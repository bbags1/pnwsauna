import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAvailableSlots, COMMUNITY_HOURS, PRIVATE_HOURS, formatTimeSlot } from '@/lib/booking-utils'
import { format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const slotType = searchParams.get('slotType') as 'community' | 'private' | null
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 })
    }
    
    const dateObj = new Date(date)
    const availableSlots = await getAvailableSlots(dateObj, slotType || undefined)
    
    // Format slots for frontend consumption
    const formattedSlots = availableSlots.map(slot => ({
      ...slot,
      timeDisplay: formatTimeSlot(slot.start_time, slot.end_time),
      spotsAvailable: slot.max_capacity - slot.current_bookings,
    }))
    
    return NextResponse.json(formattedSlots)
  } catch (error) {
    console.error('Error fetching time slots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    const supabase = createServerSupabaseClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: userProfile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (!userProfile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    
    if (action === 'generate') {
      // Generate time slots for the next 30 days
      const { generateTimeSlots } = await import('@/lib/booking-utils')
      await generateTimeSlots(30)
      return NextResponse.json({ success: true, message: 'Time slots generated' })
    }
    
    if (action === 'create') {
      const { date, startTime, endTime, slotType, maxCapacity } = body
      
      const { data: newSlot, error } = await supabase
        .from('time_slots')
        .insert({
          date,
          start_time: startTime,
          end_time: endTime,
          slot_type: slotType,
          max_capacity: maxCapacity || 8,
          current_bookings: 0,
          is_available: true,
        })
        .select()
        .single()
      
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      
      return NextResponse.json(newSlot)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error managing time slots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 