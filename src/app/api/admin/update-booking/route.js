import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req) {
  try {
    const data = await req.json();
    const { id, status, reason, customerEmail, customerName, date, time, venue } = data;

    // Update Supabase
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(error.message);

    // Send Email to Customer
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey !== '') {
      const resend = new Resend(resendApiKey);

      let subject = '';
      let html = '';

      if (status === 'Approved') {
        subject = `Reservation Confirmed: Cafe Museo`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #6d4c41;">Your Reservation is Confirmed!</h2>
            <p>Hi ${customerName},</p>
            <p>We are excited to let you know that your reservation for <strong>${date}</strong> at <strong>${time}</strong> in <strong>${venue}</strong> has been approved!</p>
            <p>We look forward to serving you.</p>
            <br/>
            <p>Best,<br/>Cafe Museo Team</p>
          </div>
        `;
      } else if (status === 'Declined') {
        subject = `Reservation Update: Cafe Museo`;
        html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #6d4c41;">Reservation Update</h2>
            <p>Hi ${customerName},</p>
            <p>Thank you for reaching out to Cafe Museo. Unfortunately, we are unable to accommodate your reservation request for <strong>${date}</strong> at <strong>${time}</strong>.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>We hope to serve you another time!</p>
            <br/>
            <p>Best,<br/>Cafe Museo Team</p>
          </div>
        `;
      }

      await resend.emails.send({
        from: 'Cafe Museo <onboarding@resend.dev>',
        to: customerEmail, 
        subject: subject,
        html: html,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Booking Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
