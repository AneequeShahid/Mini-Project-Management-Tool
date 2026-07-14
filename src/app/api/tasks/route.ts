import { NextResponse } from 'next/server';
import { TASKS } from '@/lib/data';
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project');
  const tasks = project ? TASKS.filter(t => t.project_id === project) : TASKS;
  return NextResponse.json(tasks);
}
export async function POST(req: Request) {
  const body = await req.json();
  const newTask = { id: `task-${Date.now()}`, ...body, created_at: new Date().toISOString() };
  return NextResponse.json(newTask, { status: 201 });
}
