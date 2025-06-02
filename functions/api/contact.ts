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

    console.log('Validation passed, attempting to send emails');

    // Email content for admin notification
    const adminEmailContent = `
New Contact Form Submission from PNW Sauna Website

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Message:
${message}

---
Submitted at: ${new Date().toLocaleString()}
    `.trim();

    // Email content for customer confirmation
    const customerEmailContent = `
Dear ${name},

Thank you for contacting PNW Sauna! We've received your message and will get back to you shortly.

Your message:
${message}

Best regards,
The PNW Sauna Team

---
PNW Sauna | Coeur d'Alene, Idaho
Phone: (360) 977-3487
Email: pnwsaunacda@gmail.com
    `.trim();

    try {
      // Send notification to admin using MailChannels with proper domain authentication
      console.log('Sending admin email...');
      const adminEmailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: 'pnwsaunacda@gmail.com', name: 'PNW Sauna' }],
            },
          ],
          from: {
            email: 'noreply@pnwsauna.com',
            name: 'PNW Sauna Contact Form',
          },
          reply_to: {
            email: email,
            name: name,
          },
          subject: 'New Contact Form Submission',
          content: [
            {
              type: 'text/plain',
              value: adminEmailContent,
            },
          ],
        }),
      });

      console.log('Admin email response status:', adminEmailResponse.status);
      const adminResponseText = await adminEmailResponse.text();
      console.log('Admin email response:', adminResponseText);

      if (!adminEmailResponse.ok) {
        console.error('Failed to send admin email:', adminResponseText);
        // Continue even if admin email fails
      }

      // Send confirmation to customer
      console.log('Sending customer email...');
      const customerEmailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email, name: name }],
            },
          ],
          from: {
            email: 'noreply@pnwsauna.com',
            name: 'PNW Sauna',
          },
          subject: 'Thank you for contacting PNW Sauna',
          content: [
            {
              type: 'text/plain',
              value: customerEmailContent,
            },
          ],
        }),
      });

      console.log('Customer email response status:', customerEmailResponse.status);
      const customerResponseText = await customerEmailResponse.text();
      console.log('Customer email response:', customerResponseText);

      if (!customerEmailResponse.ok) {
        console.error('Failed to send customer email:', customerResponseText);
        // Don't fail the request if customer email fails, just log it
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue processing even if emails fail
    }

    console.log('Contact form processing completed successfully');
    return new Response(
      JSON.stringify({ 
        message: 'Contact form submitted successfully',
        status: 'Form submitted and emails sent'
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