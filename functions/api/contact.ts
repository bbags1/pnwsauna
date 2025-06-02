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
    const formData = await context.request.json();
    const { name, email, phone, message } = formData;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

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

    // Send notification to admin using MailChannels
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
        subject: 'New Contact Form Submission',
        content: [
          {
            type: 'text/plain',
            value: adminEmailContent,
          },
        ],
      }),
    });

    // Send confirmation to customer
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

    if (!adminEmailResponse.ok) {
      console.error('Failed to send admin email:', await adminEmailResponse.text());
      throw new Error('Failed to send admin notification');
    }

    if (!customerEmailResponse.ok) {
      console.error('Failed to send customer email:', await customerEmailResponse.text());
      // Don't fail the request if customer email fails, just log it
    }

    return new Response(
      JSON.stringify({ message: 'Contact form submitted successfully' }),
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
      JSON.stringify({ error: 'Error submitting contact form' }),
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