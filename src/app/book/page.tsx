'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfWeek, addWeeks, isSameDay, isAfter, startOfDay } from 'date-fns'
import { CalendarIcon, ClockIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { PRICING, formatTimeSlot } from '@/lib/booking-utils'
import StripeBookingFlow from '@/components/StripeBookingFlow'

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

export default function BookPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [bookingType, setBookingType] = useState<'community' | 'private'>('community')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Fetch available slots when date or booking type changes
  useEffect(() => {
    fetchAvailableSlots()
  }, [selectedDate, bookingType])

  const fetchAvailableSlots = async () => {
    setLoading(true)
    setError(null)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const url = `/api/time-slots?date=${dateStr}&slotType=${bookingType}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch time slots: ${response.status}`)
      }
      
      const slots = await response.json()
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error fetching slots:', error)
      setError(`Failed to load available time slots: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setShowBookingForm(true)
  }

  const handleBookingClose = () => {
    setShowBookingForm(false)
    setSelectedSlot(null)
    // Refresh available slots in case booking was successful
    fetchAvailableSlots()
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
                  <p className="text-sm font-medium text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {/* Week Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setSelectedDate(addWeeks(selectedDate, -1))}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-medium">
                  {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
                </h3>
                <button
                  onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                {weekDates.map(date => (
                  <button
                    key={date.toISOString()}
                    onClick={() => canBookDate(date) && setSelectedDate(date)}
                    disabled={!canBookDate(date)}
                    className={`
                      text-center py-2 px-1 text-sm rounded-md transition-colors
                      ${isSameDay(date, selectedDate) 
                        ? 'bg-blue-600 text-white' 
                        : canBookDate(date)
                          ? 'hover:bg-blue-50 text-gray-900'
                          : 'text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {format(date, 'd')}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Type Selection */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Type</h3>
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
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Coming Soon:</strong> Private sessions and family memberships will be available in the future!
                  </p>
                </div>
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
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {slot.timeDisplay}
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <UserGroupIcon className="h-4 w-4 mr-2" />
                          {slot.spotsAvailable} spots available
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ${PRICING.community}/person
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stripe Booking Flow Modal */}
        {showBookingForm && selectedSlot && (
          <StripeBookingFlow
            timeSlot={selectedSlot}
            onCancel={handleBookingClose}
            onSuccess={handleBookingClose}
          />
        )}
      </div>
    </div>
  )
} 