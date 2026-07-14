import { NextResponse } from 'next/server';
import { MEETINGS } from '@/lib/data';
export async function GET() { return NextResponse.json(MEETINGS); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `mtg-${Date.now()}`, ...body, status: 'upcoming', recording: false }, { status: 201 });
}
