'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import AuthModal from '@/components/auth/AuthModal'

interface User {
  id: string
  email: string
  full_name: string
  membership_type: 'none' | 'monthly' | 'annual' | 'lifetime'
  membership_status: string | null
  membership_start_date: string | null
  membership_end_date: string | null
  stripe_subscription_id: string | null
  created_at: string
}

// Single membership option - monthly recurring
const membershipOption = {
  type: 'monthly' as const,
  name: 'Monthly Membership',
  price: 100,
  description: 'Unlimited community sessions + free bookings',
  features: [
    'Unlimited community sauna sessions',
    'No booking fees - completely free reservations',
    'Priority booking access',
    'Cancel anytime (service continues until period end)',
    'Support local sauna community'
  ]
}

export default function MembershipPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    // Get user session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUser(profile)
        }
      }
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUser(profile)
        }
        setShowAuthModal(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handlePurchase = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setPurchasing(true)
    
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setShowAuthModal(true)
        setPurchasing(false)
        return
      }

      // Create Stripe checkout session for membership
      const response = await fetch('/api/create-membership-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          membershipType: 'monthly'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const result = await response.json()
      
      // Redirect to Stripe Checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      console.error('Purchase error:', error)
      alert(`Purchase failed: ${error.message}`)
    } finally {
      setPurchasing(false)
    }
  }

  const handleCancelMembership = async () => {
    if (!confirm('Are you sure you want to cancel your membership? Your access will continue until the end of your current billing period.')) {
      return
    }

    setCancelling(true)
    
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Authentication required. Please sign in again.')
        setCancelling(false)
        return
      }

      const response = await fetch('/api/cancel-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel membership')
      }

      const result = await response.json()
      
      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        membership_status: 'cancelled'
      } : null)

      alert(result.message)
    } catch (error: any) {
      console.error('Cancellation error:', error)
      alert(`Cancellation failed: ${error.message}`)
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const isActiveMember = user && user.membership_type !== 'none' && user.membership_status === 'active'
  const isCancelledMember = user && user.membership_status === 'cancelled'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PNW Sauna Membership
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our community and enjoy unlimited access to authentic Finnish sauna experiences
            at Atlas Waterfront Park in Coeur d'Alene, Idaho.
          </p>
        </div>

        {user && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Current Membership</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold capitalize">
                  {user.membership_type === 'none' ? 'No Membership' : user.membership_type}
                  {isCancelledMember && (
                    <span className="text-orange-600 text-sm ml-2">(Cancelled)</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Billing Status</p>
                <p className="font-semibold capitalize">{user.membership_status || 'Inactive'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Next Billing / Expires</p>
                <p className="font-semibold">{formatDate(user.membership_end_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-semibold">{formatDate(user.membership_start_date || user.created_at)}</p>
              </div>
            </div>
            
            {isActiveMember && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={handleCancelMembership}
                  disabled={cancelling}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Membership'}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Cancelling will stop future billing but your access continues until {formatDate(user.membership_end_date)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {membershipOption.name}
              </h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ${membershipOption.price}
                <span className="text-lg text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">{membershipOption.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {membershipOption.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              onClick={handlePurchase}
              disabled={purchasing || !!isActiveMember}
              className="w-full"
            >
              {purchasing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : isActiveMember ? (
                'Current Plan'
              ) : isCancelledMember ? (
                'Reactivate Membership'
              ) : (
                'Start Monthly Membership'
              )}
            </Button>
            
            {!user && (
              <p className="text-sm text-gray-500 text-center mt-3">
                You'll need to sign in to purchase a membership
              </p>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Why become a member?
            </h3>
            <p className="text-blue-800">
              Members enjoy completely free bookings (no $15 session fees) and unlimited access to our community sauna sessions. 
              Cancel anytime with no penalties - your membership continues until the end of your billing period.
            </p>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  )
} 