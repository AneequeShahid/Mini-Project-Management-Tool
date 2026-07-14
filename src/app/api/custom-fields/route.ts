import { NextResponse } from 'next/server';
import { CUSTOM_FIELDS } from '@/lib/data';
export async function GET() { return NextResponse.json(CUSTOM_FIELDS); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `cf-${Date.now()}`, ...body }, { status: 201 });
}
