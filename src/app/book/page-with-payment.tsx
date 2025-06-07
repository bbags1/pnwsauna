'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, addWeeks, isAfter, startOfDay, isSameDay } from 'date-fns'
import { CalendarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import PaymentForm from '@/components/PaymentForm'

interface TimeSlot {
  id: string
  date: string
  start_time: string
  end_time: string
  slot_type: 'community' | 'private'
  max_capacity: number
  current_bookings: number
  timeDisplay: string
  spotsAvailable: number
}

interface BookingForm {
  date: string
  startTime: string
  endTime: string
  bookingType: 'community' | 'private'
  partySize: number
  userEmail: string
  userName: string
  userPhone: string
  notes: string
}

interface CreatedBooking {
  id: string
  totalAmount: number
  isMember: boolean
  memberDiscount: number
}

const PRICING = {
  community: 25,
  private: 200
}

export default function BookPageWithPayment() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [bookingType, setBookingType] = useState<'community' | 'private'>('community')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<CreatedBooking | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    date: '',
    startTime: '',
    endTime: '',
    bookingType: 'community',
    partySize: 1,
    userEmail: '',
    userName: '',
    userPhone: '',
    notes: ''
  })

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setBookingForm(prev => ({ 
          ...prev, 
          userEmail: user.email || '',
          userName: user.user_metadata?.full_name || ''
        }))
      }
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchAvailableSlots()
  }, [selectedDate, bookingType])

  const fetchAvailableSlots = async () => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const response = await fetch(`/api/time-slots?date=${dateStr}&slotType=${bookingType}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch time slots')
      }
      
      const slots = await response.json()
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error fetching slots:', error)
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setBookingForm(prev => ({
      ...prev,
      date: slot.date,
      startTime: slot.start_time,
      endTime: slot.end_time,
      bookingType: slot.slot_type
    }))
    setShowBookingForm(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Step 1: Create the booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      const result = await response.json()
      setCreatedBooking({
        id: result.booking.id,
        totalAmount: result.totalAmount,
        isMember: result.isMember,
        memberDiscount: result.memberDiscount
      })
      
      // Step 2: Show payment form
      setShowBookingForm(false)
      setShowPaymentForm(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false)
    setCreatedBooking(null)
    setSelectedSlot(null)
    setSuccess(true)
    fetchAvailableSlots() // Refresh availability
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  const calculatePrice = () => {
    if (bookingForm.bookingType === 'private') {
      return PRICING.private
    } else {
      return PRICING.community * bookingForm.partySize
    }
  }

  // Generate week view dates
  const weekStart = startOfWeek(selectedDate)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const canBookDate = (date: Date) => {
    return isAfter(date, startOfDay(new Date())) || isSameDay(date, new Date())
  }

  return (
    <div className="bg-white min-h-screen py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Book Your Sauna Session
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose your preferred date and time for an authentic Finnish sauna experience at Atlas Waterfront Park.
          </p>
        </div>

        {success && (
          <div className="mt-8 mx-auto max-w-2xl">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    🎉 Booking successful! You'll receive a confirmation email shortly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 mx-auto max-w-2xl">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Date Selection */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h2>
            
            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setSelectedDate(addWeeks(selectedDate, -1))}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-sm font-medium text-gray-900">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Week View */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-gray-500 font-medium">
                  {day}
                </div>
              ))}
              {weekDates.map(date => (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  disabled={!canBookDate(date)}
                  className={`
                    p-3 text-sm rounded-lg transition-colors
                    ${isSameDay(date, selectedDate) 
                      ? 'bg-blue-600 text-white' 
                      : canBookDate(date)
                        ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {format(date, 'd')}
                </button>
              ))}
            </div>

            {/* Booking Type Selection */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Type</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bookingType"
                    value="community"
                    checked={bookingType === 'community'}
                    onChange={(e) => setBookingType(e.target.value as 'community')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Community Session</span>
                    <p className="text-sm text-gray-500">${PRICING.community}/person • Shared with others</p>
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bookingType"
                    value="private"
                    checked={bookingType === 'private'}
                    onChange={(e) => setBookingType(e.target.value as 'private')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3">
                    <span className="text-sm font-medium text-gray-900">Private Session</span>
                    <p className="text-sm text-gray-500">${PRICING.private} • Exclusive use for up to 8 people</p>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Available Times - {format(selectedDate, 'EEEE, MMMM d')}
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No available slots</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try selecting a different date or session type.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableSlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    disabled={slot.spotsAvailable === 0}
                    className={`p-4 border border-gray-200 rounded-lg transition-all text-left ${
                      slot.spotsAvailable === 0 
                        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                        : 'hover:border-blue-500 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {slot.timeDisplay}
                        </div>
                        <div className="flex items-center mt-1 text-sm">
                          <UserGroupIcon className="h-4 w-4 mr-2" />
                          {slot.spotsAvailable > 0 ? (
                            <span className="text-green-600 font-medium">{slot.spotsAvailable} spots available</span>
                          ) : (
                            <span className="text-red-600 font-medium">Fully booked</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${bookingType === 'private' ? PRICING.private : PRICING.community}
                          {bookingType === 'community' && '/person'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && selectedSlot && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Complete Your Booking</h3>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {format(new Date(selectedSlot.date), 'EEEE, MMMM d')} at {selectedSlot.timeDisplay}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {selectedSlot.slot_type === 'community' ? 'Community Session' : 'Private Session'}
                  </p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.userName}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, userName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={bookingForm.userEmail}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, userEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={bookingForm.userPhone}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, userPhone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {bookingForm.bookingType === 'community' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Party Size
                      </label>
                      <select
                        value={bookingForm.partySize}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, partySize: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Array.from({ length: Math.min(8, selectedSlot.spotsAvailable) }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'person' : 'people'}
                          </option>
                        ))}
                      </select>
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
                      placeholder="Any special requests or dietary restrictions..."
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total:</span>
                      <span className="text-lg font-bold">${calculatePrice()}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Continue to Payment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && createdBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Complete Payment</h3>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {createdBooking.isMember && createdBooking.memberDiscount > 0 && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      🎉 Member discount applied! You saved ${(createdBooking.memberDiscount / 100).toFixed(2)}
                    </p>
                  </div>
                )}

                <PaymentForm
                  amount={createdBooking.totalAmount}
                  bookingId={createdBooking.id}
                  customerEmail={bookingForm.userEmail}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 