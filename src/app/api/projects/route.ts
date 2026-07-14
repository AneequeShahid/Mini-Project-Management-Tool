import { NextResponse } from 'next/server';
import { PROJECTS } from '@/lib/data';
export async function GET() { return NextResponse.json(PROJECTS); }
export async function POST(req: Request) {
  const body = await req.json();
  const newProject = { id: `proj-${Date.now()}`, ...body, progress: 0, tasks_total: 0, tasks_done: 0, sprint_count: 0 };
  return NextResponse.json(newProject, { status: 201 });
}
