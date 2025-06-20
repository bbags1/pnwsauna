'use client';

import { loadStripe } from '@stripe/stripe-js';

const PRICE_IDS = {
  SINGLE_SESSION: process.env.NEXT_PUBLIC_STRIPE_SINGLE_SESSION_PRICE_ID!,
  MEMBERSHIP: process.env.NEXT_PUBLIC_STRIPE_MEMBERSHIP_PRICE_ID!,
  FAMILY_PASS: process.env.NEXT_PUBLIC_STRIPE_FAMILY_PASS_PRICE_ID!,
};

let stripePromise: Promise<any>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

interface BookingButtonProps {
  onClick: () => Promise<void>;
  children: React.ReactNode;
}

const BookingButton: React.FC<BookingButtonProps> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200"
  >
    {children}
  </button>
);

export default function BookingPage() {
  const handlePayment = async (priceId: string, mode: 'payment' | 'subscription') => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          mode,
        }),
      });

      const { sessionId, error } = await response.json();

      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe failed to initialize');

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Book Your Sauna Experience</h1>
          <p className="text-xl text-gray-700 mb-12">Choose your preferred option below</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Single Session Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Single Session</h3>
              <p className="text-gray-700 mb-6">Perfect for first-time visitors or occasional use</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  60-minute session
                </li>
              </ul>
              <BookingButton onClick={() => handlePayment(PRICE_IDS.SINGLE_SESSION, 'payment')}>
                Book Single Session
              </BookingButton>
            </div>
          </div>

          {/* Membership Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-500">
            <div className="px-6 py-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Monthly Membership</h3>
              <p className="text-gray-700 mb-6">Best value for regular sauna enthusiasts</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited sessions
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Bring a friend for free for their first session
                </li>
              </ul>
              <BookingButton onClick={() => handlePayment(PRICE_IDS.MEMBERSHIP, 'subscription')}>
                Start Membership
              </BookingButton>
            </div>
          </div>

          {/* Family Pass Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Family Pass</h3>
              <div className="text-2xl font-bold text-blue-600 mb-4">$100</div>
              <p className="text-gray-700 mb-6">Perfect for families and small groups</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 4 people per session
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  60-minute private session
                </li>
              </ul>
              <BookingButton onClick={() => handlePayment(PRICE_IDS.FAMILY_PASS, 'payment')}>
                Book Family Pass
              </BookingButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 