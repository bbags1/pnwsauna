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
    
    // Log the contact form submission for tracking
    console.log('=== NEW CONTACT FORM SUBMISSION ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone || 'Not provided');
    console.log('Message:', message);
    console.log('Submitted at:', new Date().toISOString());
    console.log('===================================');

    // Send email via Formspree
    try {
      console.log('Sending notification via Formspree...');
      
      // Formspree endpoint for PNW Sauna contact form
      const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mnnvqnaz';
      
      const formspreeResponse = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone || 'Not provided',
          message: message,
          _subject: `New Contact Form Submission from ${name} - PNW Sauna`,
          _replyto: email,
          _format: 'plain',
          // Optional: Add some metadata
          _source: 'PNW Sauna Website',
          _timestamp: new Date().toISOString()
        })
      });

      console.log('Formspree response status:', formspreeResponse.status);
      
      if (formspreeResponse.ok) {
        console.log('Email sent successfully via Formspree');
      } else {
        const errorText = await formspreeResponse.text();
        console.error('Formspree submission failed:', errorText);
        throw new Error('Failed to send email notification');
      }

    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Still return success to user, but log for manual follow-up
      console.log('MANUAL FOLLOW-UP REQUIRED - Email failed but form submitted');
    }

    console.log('Contact form processing completed successfully');
    return new Response(
      JSON.stringify({ 
        message: 'Contact form submitted successfully',
        status: 'Message sent - we will get back to you soon!'
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