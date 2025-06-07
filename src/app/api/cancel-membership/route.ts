import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  try {
    // Get the current user with authentication from headers
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Create a properly authenticated Supabase client
    const supabase = createClient(
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
    
    // Verify the user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if user has an active subscription
    if (!userProfile.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active membership found' }, { status: 400 })
    }

    // Cancel the subscription at period end (no refund, but service continues until end of billing period)
    const subscription = await stripe.subscriptions.update(
      userProfile.stripe_subscription_id,
      {
        cancel_at_period_end: true,
        metadata: {
          cancelled_by_user: 'true',
          cancelled_at: new Date().toISOString(),
        },
      }
    )

    // Update user's membership status in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        membership_status: 'cancelled',
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating user membership status:', updateError)
      // Don't fail the request since Stripe cancellation succeeded
    }

    return NextResponse.json({ 
      success: true,
      message: 'Membership cancelled successfully. Your access will continue until the end of your current billing period.',
      periodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000).toISOString() : null
    })

  } catch (error) {
    console.error('Error cancelling membership:', error)
    return NextResponse.json({ error: 'Failed to cancel membership' }, { status: 500 })
  }
} 