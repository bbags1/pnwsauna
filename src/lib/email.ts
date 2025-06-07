import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingWithSlot {
  id: string
  user_email: string
  user_name: string
  booking_type: 'community' | 'private'
  party_size: number
  total_amount: number
  status: string
  time_slots: {
    date: string
    start_time: string
    end_time: string
    slot_type: 'community' | 'private'
  }
}

export async function sendBookingConfirmationEmail(booking: BookingWithSlot) {
  const { time_slots: timeSlot } = booking
  
  // Format date and time
  const bookingDate = new Date(timeSlot.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const startTime = new Date(`1970-01-01T${timeSlot.start_time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  const endTime = new Date(`1970-01-01T${timeSlot.end_time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const sessionType = booking.booking_type === 'community' ? 'Community Session' : 'Private Session'
  const totalPrice = (booking.total_amount / 100).toFixed(2)

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sauna Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px 0; }
        .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 40px; }
        .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">PNW Sauna</div>
          <h1>Booking Confirmed! 🧖‍♀️</h1>
        </div>
        
        <div class="content">
          <p>Hi ${booking.user_name},</p>
          
          <p>Thank you for booking your authentic Finnish sauna experience at Atlas Waterfront Park in Coeur d'Alene, Idaho!</p>
          
          <div class="booking-details">
            <h3>Booking Details</h3>
            <div class="detail-row">
              <strong>Booking ID:</strong>
              <span>${booking.id}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${bookingDate}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${startTime} - ${endTime}</span>
            </div>
            <div class="detail-row">
              <strong>Session Type:</strong>
              <span>${sessionType}</span>
            </div>
            <div class="detail-row">
              <strong>Party Size:</strong>
              <span>${booking.party_size} ${booking.party_size === 1 ? 'person' : 'people'}</span>
            </div>
            <div class="detail-row">
              <strong>Total Paid:</strong>
              <span>$${totalPrice}</span>
            </div>
          </div>
          
          <h3>What to Bring & Expect:</h3>
          <ul>
            <li>Towels (bring your own or rent on-site)</li>
            <li>Water bottle to stay hydrated</li>
            <li>Comfortable clothing for before/after</li>
            <li>Arrive 10 minutes early for orientation</li>
            <li>Experience authentic Finnish sauna culture</li>
          </ul>
          
          <h3>Location:</h3>
          <p>
            <strong>Atlas Waterfront Park</strong><br>
            Coeur d'Alene, Idaho<br>
            <em>Exact location details will be provided closer to your booking date</em>
          </p>
          
          <p>We're excited to share this authentic Finnish sauna experience with you!</p>
          
          <p>If you have any questions or need to modify your booking, please contact us.</p>
          
          <p>Warm regards,<br>The PNW Sauna Team</p>
        </div>
        
        <div class="footer">
          <p>PNW Sauna - Authentic Finnish Sauna Experiences</p>
          <p>Atlas Waterfront Park, Coeur d'Alene, Idaho</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: 'PNW Sauna <bookings@pnwsauna.com>',
      to: [booking.user_email],
      subject: `Sauna Booking Confirmed - ${bookingDate} at ${startTime}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('Confirmation email sent:', data)
    return data
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}

export async function sendBookingReminderEmail(booking: BookingWithSlot) {
  const { time_slots: timeSlot } = booking
  
  const bookingDate = new Date(timeSlot.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const startTime = new Date(`1970-01-01T${timeSlot.start_time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Sauna Booking Reminder</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px 0; }
        .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">PNW Sauna</div>
          <h1>Your sauna session is tomorrow! 🔥</h1>
        </div>
        
        <div class="content">
          <p>Hi ${booking.user_name},</p>
          
          <p>This is a friendly reminder that your Finnish sauna session is scheduled for <strong>${bookingDate} at ${startTime}</strong>.</p>
          
          <p>Don't forget to bring:</p>
          <ul>
            <li>Towels</li>
            <li>Water bottle</li>
            <li>Comfortable clothing</li>
          </ul>
          
          <p>We look forward to seeing you!</p>
          
          <p>The PNW Sauna Team</p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: 'PNW Sauna <bookings@pnwsauna.com>',
      to: [booking.user_email],
      subject: `Reminder: Your sauna session is tomorrow - ${bookingDate}`,
      html: emailHtml,
    })

    if (error) {
      throw new Error(`Failed to send reminder email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Reminder email error:', error)
    throw error
  }
} 