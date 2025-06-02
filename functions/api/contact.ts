interface Env {
  // Add any environment variables here if needed
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    console.log('Contact form endpoint called');
    
    const formData = await context.request.json();
    console.log('Form data received:', JSON.stringify(formData, null, 2));
    
    const { name, email, phone, message } = formData;

    // Validate required fields
    if (!name || !email || !message) {
      console.log('Validation failed - missing fields');
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    console.log('Validation passed');
    
    // Log the contact form submission for manual follow-up
    console.log('=== NEW CONTACT FORM SUBMISSION ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone || 'Not provided');
    console.log('Message:', message);
    console.log('Submitted at:', new Date().toISOString());
    console.log('===================================');

    // TODO: To enable email sending with pages.dev domain, choose one of these options:
    // 
    // Option 1: Set up Formspree (easiest)
    // 1. Sign up at https://formspree.io
    // 2. Create a new form and get your endpoint URL
    // 3. Replace this comment with the Formspree fetch call
    //
    // Option 2: Add custom domain to Cloudflare Pages
    // 1. Go to Pages → Settings → Domains
    // 2. Add pnwsauna.com as custom domain
    // 3. Then use MailChannels with proper DNS records
    //
    // Option 3: Use SendGrid API
    // 1. Sign up for SendGrid
    // 2. Add API key as environment variable
    // 3. Use SendGrid API instead of MailChannels

    console.log('Contact form processing completed successfully');
    return new Response(
      JSON.stringify({ 
        message: 'Contact form submitted successfully',
        status: 'Message received - we will get back to you soon!'
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error submitting contact form',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
} 