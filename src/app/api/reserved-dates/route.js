import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('date')
      .eq('status', 'Approved');

    if (error) throw new Error(error.message);

    const dates = [...new Set(data.map(r => r.date))];
    return NextResponse.json({ dates });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
