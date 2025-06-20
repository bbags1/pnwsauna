import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  NEXT_PUBLIC_SITE_URL: string;
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    console.log('Received checkout session request');

    if (!context.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    const body = await context.request.json();
    console.log('Request body:', body);

    const { priceId, mode } = body;

    if (!priceId) {
      console.error('Missing priceId in request');
      return new Response(
        JSON.stringify({ error: 'Price ID is required' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!mode || !['payment', 'subscription'].includes(mode)) {
      console.error('Invalid mode:', mode);
      return new Response(
        JSON.stringify({ error: 'Invalid payment mode' }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    console.log('Initializing Stripe with API version 2025-05-28.basil');
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    });

    console.log('Creating Stripe checkout session');
    const session = await stripe.checkout.sessions.create({
      mode: mode as 'payment' | 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${context.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${context.env.NEXT_PUBLIC_SITE_URL}/`,
    });

    console.log('Checkout session created:', session.id);
    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Check if it's a Stripe error
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({ 
          error: 'Payment service error',
          message: error.message,
          type: error.type,
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: 'Error creating checkout session',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
} 