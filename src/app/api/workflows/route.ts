import { NextResponse } from 'next/server';
import { WORKFLOWS } from '@/lib/data';
export async function GET() { return NextResponse.json(WORKFLOWS); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `wf-${Date.now()}`, ...body, runs: 0, last_run: 'never', status: 'active' }, { status: 201 });
}
