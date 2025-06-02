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
    console.log('Events form endpoint called');
    
    const formData = await context.request.json();
    console.log('Form data received:', JSON.stringify(formData, null, 2));
    
    const { name, email, phone, groupSize, preferredDate, eventType, message } = formData;

    // Validate required fields
    if (!name || !email || !groupSize || !preferredDate || !eventType) {
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
    
    // Log the events form submission (for now, until we fix MailChannels)
    console.log('NEW EVENTS FORM SUBMISSION:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Phone:', phone || 'Not provided');
    console.log('Group Size:', groupSize);
    console.log('Preferred Date:', preferredDate);
    console.log('Event Type:', eventType);
    console.log('Message:', message || 'No message provided');
    console.log('Submitted at:', new Date().toISOString());
    console.log('---END SUBMISSION---');

    // TODO: Re-enable MailChannels after domain verification
    // For now, just return success so the form works
    
    console.log('Events form processing completed successfully');
    return new Response(
      JSON.stringify({ 
        message: 'Event inquiry submitted successfully',
        status: 'Form data logged - email system will be enabled soon'
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
    console.error('Events form error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error submitting event inquiry',
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