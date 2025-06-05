import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { generateTimeSlots } from '@/lib/booking-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, adminEmail } = body

    if (action === 'setup') {
      const supabase = createAdminSupabaseClient()

      // Generate time slots for the next 30 days
      await generateTimeSlots(30)

      // If adminEmail is provided, make that user an admin
      if (adminEmail) {
        const { error: adminError } = await supabase
          .from('users')
          .update({ is_admin: true })
          .eq('email', adminEmail)

        if (adminError) {
          console.error('Error setting admin:', adminError)
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'System initialized successfully. Time slots generated.' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error initializing system:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 