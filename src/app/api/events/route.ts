import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, eventType, date, guests, message } = body;

    // Format the email content
    const adminEmailContent = `
New Event Booking Request

Name: ${name}
Email: ${email}
Phone: ${phone}
Event Type: ${eventType}
Preferred Date: ${date}
Number of Guests: ${guests}
Additional Details:
${message}
    `;

    const customerEmailContent = `
Dear ${name},

Thank you for your event booking request! We've received your request for a ${eventType} event on ${date}.

Our team will review your request and get back to you within 24-48 hours to discuss the details and confirm availability.

Event Details:
- Event Type: ${eventType}
- Preferred Date: ${date}
- Number of Guests: ${guests}

If you need to make any changes to your request or have immediate questions, please contact us at (360) 977-3487.

Best regards,
The PNW Sauna Team
    `;

    // Send notification to admin
    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'pnwsaunacda@gmail.com', name: 'PNW Sauna' }],
          },
        ],
        from: {
          email: 'events@pnwsaunacda.com',
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
    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email, name: name }],
          },
        ],
        from: {
          email: 'events@pnwsaunacda.com',
          name: 'PNW Sauna',
        },
        subject: 'Thank you for your event booking request',
        content: [
          {
            type: 'text/plain',
            value: customerEmailContent,
          },
        ],
      }),
    });

    return NextResponse.json(
      { message: 'Event request submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Event request error:', error);
    return NextResponse.json(
      { error: 'Error submitting event request' },
      { status: 500 }
    );
  }
} 