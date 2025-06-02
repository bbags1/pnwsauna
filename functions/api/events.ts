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
    const { name, email, phone, eventType, date, guests, message } = formData;

    // Validate required fields
    if (!name || !email || !eventType || !date || !guests || !message) {
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
New Event Booking Request from PNW Sauna Website

Contact Information:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Event Details:
Event Type: ${eventType}
Preferred Date: ${date}
Number of Guests: ${guests}

Additional Details:
${message}

---
Submitted at: ${new Date().toLocaleString()}
    `.trim();

    // Email content for customer confirmation
    const customerEmailContent = `
Dear ${name},

Thank you for your event booking request with PNW Sauna! We've received your submission and will get back to you within 24-48 hours with availability and pricing information.

Your Event Details:
- Event Type: ${eventType}
- Preferred Date: ${date}
- Number of Guests: ${guests}
- Additional Details: ${message}

We're excited to help you create an unforgettable sauna experience for your group!

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
          name: 'PNW Sauna Events',
        },
        subject: 'New Event Booking Request',
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
        subject: 'Event Booking Request Received - PNW Sauna',
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
      JSON.stringify({ message: 'Event request submitted successfully' }),
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
      JSON.stringify({ error: 'Error submitting event request' }),
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