import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req) {
  try {
    const data = await req.json();
    const { id, status, reason, message, customerEmail, customerName, date, time, venue } = data;

    // 0. Double-check if date is already booked by another reservation before approving
    if (status === 'Approved') {
      const { data: existingBookings, error: checkError } = await supabase
        .from('reservations')
        .select('id')
        .eq('date', date)
        .eq('status', 'Approved')
        .neq('id', id);

      if (checkError) throw new Error(checkError.message);
      if (existingBookings && existingBookings.length > 0) {
        return NextResponse.json({ error: "Another reservation is already approved for this date." }, { status: 400 });
      }
    }

    // 1. Always update the database first
    const { data: updateData, error: dbError } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select();

    console.log("Update result:", { updateData, dbError, id, status });

    if (dbError) {
      console.error("Supabase DB Error:", JSON.stringify(dbError));
      throw new Error(dbError.message);
    }

    // 2. Try to send email (but don't fail if it doesn't work)
    let emailSent = false;
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && resendApiKey !== '') {
      try {
        const resend = new Resend(resendApiKey);

        let subject = '';
        let html = '';
        const adminMessage = message || reason || '';

        if (status === 'Approved') {
          subject = `Reservation Confirmed: Cafe Museo`;
          html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #6d4c41;">Your Reservation is Confirmed!</h2>
              <p>Hi ${customerName},</p>
              <p>We are excited to let you know that your reservation for <strong>${date}</strong> at <strong>${time}</strong> in <strong>${venue || 'our venue'}</strong> has been approved!</p>
              ${adminMessage ? `<p><strong>Message from Cafe Museo:</strong> ${adminMessage}</p>` : ''}
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
              ${adminMessage ? `<p><strong>Reason:</strong> ${adminMessage}</p>` : ''}
              <p>We hope to serve you another time!</p>
              <br/>
              <p>Best,<br/>Cafe Museo Team</p>
            </div>
          `;
        } else if (status === 'Cancelled') {
          subject = `Reservation Cancelled: Cafe Museo`;
          html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #6d4c41;">Reservation Cancelled</h2>
              <p>Hi ${customerName},</p>
              <p>We regret to inform you that your previously approved reservation for <strong>${date}</strong> at <strong>${time}</strong> in <strong>${venue || 'our venue'}</strong> has been cancelled.</p>
              ${adminMessage ? `<p><strong>Reason:</strong> ${adminMessage}</p>` : ''}
              <p>We sincerely apologize for the inconvenience. Please feel free to submit a new reservation for a different date.</p>
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
        emailSent = true;
      } catch (emailErr) {
        console.error("Email send failed (non-critical):", emailErr);
      }
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error("Update Booking Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
