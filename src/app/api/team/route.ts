import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { ROLE_DEFINITIONS } from '@/lib/roles'; // Note: if ROLE_DEFINITIONS was in lib/data, we might need to recreate it or hardcode. Let's fix this in a sec.

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseServer.from('team_members').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, error } = await supabaseServer.from('team_members').insert([body]).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
