import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, phone, venue, date, time, guests, type, special_requests } = data;

    const resendApiKey = process.env.RESEND_API_KEY;
    const viberToken = process.env.VIBER_BOT_TOKEN;
    const viberReceiverId = process.env.VIBER_RECEIVER_ID;
    const ownerEmail = 'cafemuseoph@gmail.com';

    const messageText = `
New Reservation Inquiry!
Name: ${name}
Email: ${email}
Phone: ${phone}
Venue: ${venue}
Event Type: ${type}
Date: ${date}
Time: ${time}
Guests: ${guests}
Notes: ${special_requests || 'None'}
    `.trim();

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

    const tasks = [];

    // 1. Send via Resend
    if (resendApiKey && resendApiKey !== '') {
      const resend = new Resend(resendApiKey);
      tasks.push(
        resend.emails.send({
          from: 'Cafe Museo <onboarding@resend.dev>', // Only works for the verified email on the Resend account
          to: ownerEmail,
          subject: `New Booking: ${type} on ${date}`,
          html: emailHtml,
        }).catch(err => console.error("Resend error:", err))
      );
    }

    // 2. Send via Viber
    if (viberToken && viberToken !== '' && viberReceiverId && viberReceiverId !== '') {
      tasks.push(
        fetch('https://chatapi.viber.com/pa/send_message', {
          method: 'POST',
          headers: {
            'X-Viber-Auth-Token': viberToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiver: viberReceiverId,
            type: 'text',
            text: messageText,
            sender: {
              name: 'Cafe Museo Website'
            }
          })
        }).catch(err => console.error("Viber error:", err))
      );
    }

    if (tasks.length > 0) {
      await Promise.allSettled(tasks);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notify API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
