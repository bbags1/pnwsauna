'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import LiabilityWaiver from './LiabilityWaiver'

interface TimeSlot {
  id: string
  date: string
  start_time: string
  end_time: string
  slot_type: 'community' | 'private'
  max_capacity: number
  spotsAvailable: number
  timeDisplay: string
}

interface StripeBookingFlowProps {
  timeSlot: TimeSlot
  onCancel: () => void
  onSuccess: () => void
}

interface BookingForm {
  sessionType: 'community' | 'private'
  partySize: number
  customerEmail: string
  customerName: string
  customerPhone: string
  notes: string
}

const PRICING = {
  community: 15,
  // private: 200, // Private sessions coming in the future
}

export default function StripeBookingFlow({ timeSlot, onCancel, onSuccess }: StripeBookingFlowProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [showWaiver, setShowWaiver] = useState(false)
  const [waiverId, setWaiverId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  const [bookingForm, setBookingForm] = useState({
    sessionType: 'community' as 'community' | 'private',
    partySize: 1,
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    notes: '',
  })

  useEffect(() => {
    // Check if user is logged in and is a member
    const checkMemberStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setBookingForm(prev => ({
          ...prev,
          customerEmail: user.email || '',
        }))

        // Get user profile to check membership
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setBookingForm(prev => ({
            ...prev,
            customerName: profile.full_name || '',
          }))

          // Check if user has active membership
          const hasActiveMembership = profile.membership_type !== 'none' && 
                                    profile.membership_status === 'active'
          setIsMember(hasActiveMembership)
        }
      }
    }

    checkMemberStatus()
  }, [])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    if (!bookingForm.customerEmail || !bookingForm.customerName || !bookingForm.customerPhone) {
      setError('Please fill in all required fields')
      return
    }

    // Show waiver if not already signed
    if (!waiverId) {
      setShowWaiver(true)
      return
    }

    // Proceed with booking after waiver is signed (pass waiver ID directly)
    await processBooking(waiverId)
  }

  const processBooking = async (providedWaiverId?: string) => {
    setLoading(true)

    try {
      // Use provided waiver ID or fall back to state
      const currentWaiverId = providedWaiverId || waiverId
      
      if (!currentWaiverId) {
        throw new Error('Liability waiver must be signed before booking')
      }

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization header if user is authenticated
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      // Create Stripe Checkout Session or direct booking for members
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          timeSlotId: timeSlot.id,
          sessionType: bookingForm.sessionType,
          partySize: bookingForm.partySize,
          customerEmail: bookingForm.customerEmail,
          customerName: bookingForm.customerName,
          customerPhone: bookingForm.customerPhone,
          notes: bookingForm.notes,
          waiverId: currentWaiverId, // Use the waiver ID directly
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const result = await response.json()
      
      // Check if this is a member booking (free)
      if (result.memberBooking) {
        // Show success message and close modal
        alert(result.message)
        onSuccess()
        return
      }
      
      // Redirect to Stripe Checkout for non-members
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleWaiverSigned = (newWaiverId: string) => {
    setWaiverId(newWaiverId)
    setShowWaiver(false)
    // Show a success message that the waiver was signed
    alert('Liability waiver signed successfully! Please review your booking details and continue.')
  }

  const handleWaiverCancel = () => {
    setShowWaiver(false)
  }

  const calculatePrice = () => {
    // Only community sessions are available for now
    return PRICING.community * bookingForm.partySize
  }

  const sessionDate = format(new Date(timeSlot.date), 'EEEE, MMMM d, yyyy')
  const maxPartySize = Math.min(8, timeSlot.spotsAvailable)

  return (
    <>
      {showWaiver && (
        <LiabilityWaiver
          customerName={bookingForm.customerName}
          customerEmail={bookingForm.customerEmail}
          customerPhone={bookingForm.customerPhone}
          onWaiverSigned={handleWaiverSigned}
          onCancel={handleWaiverCancel}
        />
      )}

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">Book Your Session</h2>
            <p className="text-gray-600 mt-2">
              {sessionDate} at {timeSlot.timeDisplay}
            </p>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Book Your Sauna Session</h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{sessionDate}</strong><br />
                {timeSlot.timeDisplay}<br />
                {timeSlot.slot_type === 'community' ? 'Community Session' : 'Private Session'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingForm.customerName}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={bookingForm.customerEmail}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={bookingForm.customerPhone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(optional)"
                />
              </div>

              {bookingForm.sessionType === 'community' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Party Size
                  </label>
                  <select
                    value={bookingForm.partySize}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, partySize: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: maxPartySize }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'person' : 'people'}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {timeSlot.spotsAvailable} spots available
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special requests or notes..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                {waiverId && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-green-800">
                        ✓ Liability waiver signed
                      </span>
                    </div>
                  </div>
                )}
                
                {isMember ? (
                  <div className="text-center">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Member Price:</span>
                      <span className="text-xl font-bold text-green-600">FREE</span>
                    </div>
                    <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                      🎉 As a member, all community sessions are completely free!
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="text-xl font-bold">${calculatePrice()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Secure payment with Stripe
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      💡 <strong>Tip:</strong> Members get free bookings! <a href="/membership" className="underline">Learn more</a>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : !waiverId ? (
                    'Sign Waiver & Continue'
                  ) : isMember ? (
                    'Confirm Free Booking'
                  ) : (
                    'Pay with Stripe'
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                {isMember ? (
                  'Your booking will be confirmed immediately as a member benefit.'
                ) : (
                  "You'll be redirected to Stripe's secure checkout page to complete your payment. Your booking will be confirmed immediately after payment."
                )}
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
} 