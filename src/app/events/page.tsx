'use client';

import { useState, useRef } from 'react';
import { EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline'

export default function Events() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      groupSize: formData.get('guests'),
      preferredDate: formData.get('date'),
      eventType: formData.get('event-type'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitStatus('success');
      if (formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative isolate bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
          <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
            <div className="absolute inset-y-0 left-0 -z-10 w-full overflow-hidden bg-gray-100 ring-1 ring-gray-900/10 lg:w-1/2">
              <div className="absolute -left-56 top-[calc(100%-13rem)] transform-gpu blur-3xl lg:left-[max(-14rem,calc(100%-59rem))] lg:top-[calc(50%-7rem)]">
                <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-br from-blue-100 to-blue-800 opacity-20" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Book a Private Event</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Host a unique and memorable event with our mobile sauna. Perfect for:
            </p>
            <ul className="mt-4 text-base leading-7 text-gray-600">
              <li className="flex items-center gap-x-3">
                <CalendarIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                Corporate wellness events
              </li>
              <li className="flex items-center gap-x-3 mt-2">
                <CalendarIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                Private parties and celebrations
              </li>
              <li className="flex items-center gap-x-3 mt-2">
                <CalendarIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                Wellness retreats
              </li>
              <li className="flex items-center gap-x-3 mt-2">
                <CalendarIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                Team building activities
              </li>
              <li className="flex items-center gap-x-3 mt-2">
                <CalendarIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                Special occasions
              </li>
            </ul>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Contact us to discuss your event details and we'll create a custom experience for your group.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48" ref={formRef}>
          <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
            {submitStatus === 'success' && (
              <div className="mb-6 rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Event request submitted successfully! We'll get back to you within 24-48 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      There was an error submitting your event request. Please try again.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">
                  Name
                </label>
                <div className="mt-2.5">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    autoComplete="name"
                    required
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                  Email
                </label>
                <div className="mt-2.5">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="phone" className="block text-sm font-semibold leading-6 text-gray-900">
                  Phone number
                </label>
                <div className="mt-2.5">
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    autoComplete="tel"
                    required
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="event-type" className="block text-sm font-semibold leading-6 text-gray-900">
                  Event Type
                </label>
                <div className="mt-2.5">
                  <select
                    id="event-type"
                    name="event-type"
                    required
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select an event type</option>
                    <option value="corporate">Corporate Wellness Event</option>
                    <option value="private-party">Private Party</option>
                    <option value="retreat">Wellness Retreat</option>
                    <option value="team-building">Team Building</option>
                    <option value="special-occasion">Special Occasion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="date" className="block text-sm font-semibold leading-6 text-gray-900">
                  Preferred Date
                </label>
                <div className="mt-2.5">
                  <input
                    type="date"
                    name="date"
                    id="date"
                    required
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="guests" className="block text-sm font-semibold leading-6 text-gray-900">
                  Number of Guests
                </label>
                <div className="mt-2.5">
                  <input
                    type="number"
                    name="guests"
                    id="guests"
                    min="1"
                    required
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                  Additional Details
                </label>
                <div className="mt-2.5">
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    required
                    placeholder="Tell us more about your event..."
                    className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Event Request'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 