'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

interface BookingDetails {
  sessionId: string
  customerEmail: string
  amountTotal: number
  sessionDate: string
  sessionTime: string
  sessionType: string
  partySize: number
  location: string
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      fetchBookingDetails(sessionId)
    } else {
      setError('No session ID found')
      setLoading(false)
    }
  }, [sessionId])

  const fetchBookingDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/booking-details?session_id=${sessionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch booking details')
      }

      const data = await response.json()
      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking details:', error)
      setError('Unable to load booking details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Booking Error</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link 
            href="/book"
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Try Booking Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Booking Confirmed! 🎉
            </h1>
            <p className="mt-2 text-gray-600">
              Your sauna session has been successfully booked and paid for.
            </p>
          </div>

          {booking && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Details
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session ID:</span>
                  <span className="font-medium text-gray-900">
                    {booking.sessionId.slice(-8).toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">
                    {booking.customerEmail}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {booking.sessionDate}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium text-gray-900">
                    {booking.sessionTime}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Type:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {booking.sessionType}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Party Size:</span>
                  <span className="font-medium text-gray-900">
                    {booking.partySize} {booking.partySize === 1 ? 'person' : 'people'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-bold text-gray-900">
                    ${(booking.amountTotal / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              What's Next?
            </h3>
            
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
                Check your email for a detailed confirmation and receipt
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
                Arrive 10 minutes early for orientation
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
                Bring towels and water bottle
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
                Location details will be sent closer to your session date
              </li>
            </ul>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/book"
              className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors block"
            >
              Book Another Session
            </Link>
            
            <Link
              href="/"
              className="w-full bg-gray-100 text-gray-900 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors block"
            >
              Return Home
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Questions? Contact us at{' '}
              <a href="mailto:hello@pnwsauna.com" className="text-blue-600 hover:underline">
                hello@pnwsauna.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 