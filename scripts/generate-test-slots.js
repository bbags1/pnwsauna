const { createClient } = require('@supabase/supabase-js')
const { format, addDays } = require('date-fns')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function generateTestSlots() {
  console.log('🕐 Generating test time slots...')
  
  const today = new Date()
  const tomorrow = addDays(today, 1)
  const dayAfter = addDays(today, 2)
  
  const slots = [
    // Tomorrow
    { date: format(tomorrow, 'yyyy-MM-dd'), start_time: '19:00:00', end_time: '20:00:00' },
    { date: format(tomorrow, 'yyyy-MM-dd'), start_time: '20:00:00', end_time: '21:00:00' },
    { date: format(tomorrow, 'yyyy-MM-dd'), start_time: '21:00:00', end_time: '22:00:00' },
    // Day after
    { date: format(dayAfter, 'yyyy-MM-dd'), start_time: '19:00:00', end_time: '20:00:00' },
    { date: format(dayAfter, 'yyyy-MM-dd'), start_time: '20:00:00', end_time: '21:00:00' },
  ]
  
  for (const slot of slots) {
    const { data, error } = await supabase
      .from('time_slots')
      .upsert({
        ...slot,
        slot_type: 'community',
        max_capacity: 8,
        current_bookings: 0,
        is_available: true
      }, { onConflict: 'date,start_time,slot_type' })
    
    if (error) {
      console.error('❌ Error creating slot:', error)
    } else {
      console.log('✅ Created slot:', slot.date, slot.start_time)
    }
  }
  
  console.log('🎉 Test slots generated!')
}

generateTestSlots().catch(console.error) 