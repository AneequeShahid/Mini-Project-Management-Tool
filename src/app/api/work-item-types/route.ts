import { NextResponse } from 'next/server';
import { WORK_ITEM_TYPES } from '@/lib/data';
export async function GET() { return NextResponse.json(WORK_ITEM_TYPES); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `type-${Date.now()}`, ...body }, { status: 201 });
}
