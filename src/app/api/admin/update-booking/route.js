import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req) {
  try {
    // Verify Authorization Header
    const authHeader = req.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || 'CafeMuseo2011AnyaKayla';
    if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: "Unauthorized access. Invalid credentials." }, { status: 401 });
    }

    const data = await req.json();
    const { id, status, reason, message, customerEmail, customerName, date, time, venue } = data;



    // 1. Always update or delete the database first
    let dbError = null;
    let updateData = null;
    if (status === 'Delete') {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);
      dbError = error;
    } else {
      const { data, error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id)
        .select();
      updateData = data;
      dbError = error;
    }

    console.log("Database result:", { updateData, dbError, id, status });

    if (dbError) {
      console.error("Supabase DB Error:", JSON.stringify(dbError));
      throw new Error(dbError.message);
    }

    if (status === 'Delete') {
      return NextResponse.json({ success: true, emailSent: false });
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
              <p>To finalize the coordination and details for your event, please reach out to us on our Facebook page (<strong>Cafe Museo</strong>) or reply directly to this email so we can discuss your menu preferences and specific requirements.</p>
              <p>We look forward to serving you.</p>
              <br/>
              <p>Best,<br/>Cafe Museo</p>
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
              <p>Best,<br/>Cafe Museo</p>
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
              <p>Best,<br/>Cafe Museo</p>
            </div>
          `;
        }

        await resend.emails.send({
          from: 'Cafe Museo <reservations@cafemuseo.ph>',
          to: customerEmail,
          replyTo: 'cafemuseoph@gmail.com',
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
