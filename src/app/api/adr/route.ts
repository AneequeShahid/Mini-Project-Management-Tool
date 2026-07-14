import { NextResponse } from 'next/server';
import { ADR_RECORDS } from '@/lib/data';
export async function GET() { return NextResponse.json(ADR_RECORDS); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `adr-${Date.now()}`, number: `ADR-${String(Date.now() % 1000).padStart(3, '0')}`, ...body, date: new Date().toISOString().slice(0, 10) }, { status: 201 });
}
