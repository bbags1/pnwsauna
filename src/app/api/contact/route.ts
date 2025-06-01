import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Format the email content
    const adminEmailContent = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone}
Message:
${message}
    `;

    const customerEmailContent = `
Dear ${name},

Thank you for contacting PNW Sauna! We've received your message and will get back to you shortly.

Best regards,
The PNW Sauna Team
    `;

    // Send notification to admin (this will be handled by Cloudflare Email Routing)
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
          email: 'contact@pnwsaunacda.com',
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
          email: 'contact@pnwsaunacda.com',
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

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Error submitting contact form' },
      { status: 500 }
    );
  }
} 