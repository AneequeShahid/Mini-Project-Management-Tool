import { NextResponse } from 'next/server';
import { SPRINTS } from '@/lib/data';
export async function GET(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return NextResponse.json(SPRINTS.filter(s => s.project_id === projectId));
}
