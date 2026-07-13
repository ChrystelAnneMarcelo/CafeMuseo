import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, phone, venue, date, time, guests, type, special_requests } = data;

    const resendApiKey = process.env.RESEND_API_KEY;
    const ownerEmail = 'cafemuseoph@gmail.com';

    const emailHtml = `
      <h2>New Reservation Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Venue:</strong> ${venue}</p>
      <p><strong>Event Type:</strong> ${type}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Guests:</strong> ${guests}</p>
      <p><strong>Notes:</strong> ${special_requests || 'None'}</p>
    `;

    // Send email via Resend
    if (resendApiKey && resendApiKey !== '') {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'Cafe Museo <reservations@cafemuseo.ph>',
          to: ownerEmail,
          subject: `New Booking: ${type} on ${date}`,
          html: emailHtml,
        });
      } catch (err) {
        console.error("Resend error:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notify API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
