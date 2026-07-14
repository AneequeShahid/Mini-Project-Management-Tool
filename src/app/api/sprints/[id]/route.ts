import { NextResponse } from 'next/server';
import { SPRINTS } from '@/lib/data';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(SPRINTS.find(s => s.id === id) || SPRINTS[0]);
}
