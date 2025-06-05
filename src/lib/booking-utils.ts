import { format, addDays, isAfter, startOfDay, addHours, setHours, setMinutes } from 'date-fns'
import { createAdminSupabaseClient } from './supabase'

// Pricing configuration
export const PRICING = {
  community: 25, // $25 per person for community sessions
  private: 200,  // $200 for private sessions (up to 8 people)
} as const

// Time slot configuration
export const COMMUNITY_HOURS = [
  { start: 6, end: 7 },   // 6-7am
  { start: 7, end: 8 },   // 7-8am  
  { start: 8, end: 9 },   // 8-9am
  { start: 19, end: 20 }, // 7-8pm
  { start: 20, end: 21 }, // 8-9pm
  { start: 21, end: 22 }, // 9-10pm
  { start: 22, end: 23 }, // 10-11pm
] as const

export const PRIVATE_HOURS = [
  { start: 7, end: 8 },   // 7-8am
  { start: 8, end: 9 },   // 8-9am
  { start: 9, end: 10 },  // 9-10am
  { start: 10, end: 11 }, // 10-11am
  { start: 11, end: 12 }, // 11am-12pm
  { start: 12, end: 13 }, // 12-1pm
  { start: 13, end: 14 }, // 1-2pm
  { start: 14, end: 15 }, // 2-3pm
  { start: 15, end: 16 }, // 3-4pm
  { start: 16, end: 17 }, // 4-5pm
  { start: 17, end: 18 }, // 5-6pm
  { start: 18, end: 19 }, // 6-7pm
  { start: 19, end: 20 }, // 7-8pm
  { start: 20, end: 21 }, // 8-9pm
  { start: 21, end: 22 }, // 9-10pm
] as const

// Generate time slots for a given date
export async function generateTimeSlotsForDate(date: Date) {
  const supabase = createAdminSupabaseClient()
  const dateStr = format(date, 'yyyy-MM-dd')
  
  const slotsToCreate = []
  
  // Generate community slots
  for (const hour of COMMUNITY_HOURS) {
    slotsToCreate.push({
      date: dateStr,
      start_time: `${hour.start.toString().padStart(2, '0')}:00:00`,
      end_time: `${hour.end.toString().padStart(2, '0')}:00:00`,
      slot_type: 'community' as const,
      max_capacity: 8,
      current_bookings: 0,
      is_available: true,
    })
  }
  
  // Generate private slots (these will be created on-demand when booked)
  // We don't pre-create private slots to avoid clutter
  
  const { data, error } = await supabase
    .from('time_slots')
    .upsert(slotsToCreate, { 
      onConflict: 'date,start_time,slot_type',
      ignoreDuplicates: true 
    })
    .select()
  
  if (error) {
    console.error('Error generating time slots:', error)
    throw error
  }
  
  return data
}

// Generate time slots for the next N days
export async function generateTimeSlots(daysAhead = 30) {
  const today = startOfDay(new Date())
  const promises = []
  
  for (let i = 0; i <= daysAhead; i++) {
    const date = addDays(today, i)
    promises.push(generateTimeSlotsForDate(date))
  }
  
  await Promise.all(promises)
}

// Get available time slots for a date
export async function getAvailableSlots(date: Date, slotType?: 'community' | 'private') {
  const supabase = createAdminSupabaseClient()
  const dateStr = format(date, 'yyyy-MM-dd')
  
  let query = supabase
    .from('time_slots')
    .select('*')
    .eq('date', dateStr)
    .eq('is_available', true)
    .order('start_time')
  
  if (slotType) {
    query = query.eq('slot_type', slotType)
  }
  
  const { data: slots, error } = await query
  
  if (error) {
    console.error('Error fetching time slots:', error)
    throw error
  }
  
  // For private slots, we need to check what times are available
  if (slotType === 'private') {
    const availablePrivateSlots = []
    
    for (const hour of PRIVATE_HOURS) {
      const startTime = `${hour.start.toString().padStart(2, '0')}:00:00`
      
      // Check if there's any community or private booking at this time
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('*, time_slots(*)')
        .eq('time_slots.date', dateStr)
        .eq('time_slots.start_time', startTime)
        .eq('status', 'confirmed')
      
      if (!existingBookings || existingBookings.length === 0) {
        availablePrivateSlots.push({
          id: `private-${dateStr}-${startTime}`,
          date: dateStr,
          start_time: startTime,
          end_time: `${hour.end.toString().padStart(2, '0')}:00:00`,
          slot_type: 'private' as const,
          max_capacity: 8,
          current_bookings: 0,
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }
    
    return availablePrivateSlots
  }
  
  // Filter community slots based on availability
  return slots?.filter(slot => {
    if (slot.slot_type === 'community') {
      return slot.current_bookings < slot.max_capacity
    }
    return true
  }) || []
}

// Check if a time slot is available for booking
export async function isSlotAvailable(
  date: string, 
  startTime: string, 
  partySize: number, 
  bookingType: 'community' | 'private'
) {
  const supabase = createAdminSupabaseClient()
  
  if (bookingType === 'private') {
    // For private bookings, check if ANY bookings exist at this time
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('*, time_slots(*)')
      .eq('time_slots.date', date)
      .eq('time_slots.start_time', startTime)
      .eq('status', 'confirmed')
    
    return !existingBookings || existingBookings.length === 0
  } else {
    // For community bookings, check capacity
    const { data: slot } = await supabase
      .from('time_slots')
      .select('*')
      .eq('date', date)
      .eq('start_time', startTime)
      .eq('slot_type', 'community')
      .single()
    
    if (!slot) return false
    
    return slot.current_bookings + partySize <= slot.max_capacity
  }
}

// Create or get a time slot
export async function createOrGetTimeSlot(
  date: string,
  startTime: string,
  endTime: string,
  slotType: 'community' | 'private'
) {
  const supabase = createAdminSupabaseClient()
  
  // Try to get existing slot
  const { data: existingSlot } = await supabase
    .from('time_slots')
    .select('*')
    .eq('date', date)
    .eq('start_time', startTime)
    .eq('slot_type', slotType)
    .single()
  
  if (existingSlot) {
    return existingSlot
  }
  
  // Create new slot
  const { data: newSlot, error } = await supabase
    .from('time_slots')
    .insert({
      date,
      start_time: startTime,
      end_time: endTime,
      slot_type: slotType,
      max_capacity: 8,
      current_bookings: 0,
      is_available: true,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating time slot:', error)
    throw error
  }
  
  return newSlot
}

// Calculate booking price
export function calculateBookingPrice(
  bookingType: 'community' | 'private',
  partySize: number
): number {
  if (bookingType === 'private') {
    return PRICING.private * 100 // Convert to cents
  } else {
    return PRICING.community * partySize * 100 // Convert to cents
  }
}

// Format time for display
export function formatTimeSlot(startTime: string, endTime: string): string {
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  
  return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
}

// Check if user has active membership
export function hasActiveMembership(user: any): boolean {
  if (!user?.membership_type || user.membership_type === 'none') {
    return false
  }
  
  if (user.membership_type === 'lifetime') {
    return true
  }
  
  if (user.membership_expires_at) {
    return isAfter(new Date(user.membership_expires_at), new Date())
  }
  
  return false
}

// Get member discount price
export function getMemberPrice(
  bookingType: 'community' | 'private',
  partySize: number
): number {
  // Members get 50% off community sessions, 25% off private sessions
  const basePrice = calculateBookingPrice(bookingType, partySize)
  
  if (bookingType === 'community') {
    return Math.round(basePrice * 0.5)
  } else {
    return Math.round(basePrice * 0.75)
  }
} 