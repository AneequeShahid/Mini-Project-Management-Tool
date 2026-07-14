import { NextResponse } from 'next/server';
import { TASKS } from '@/lib/data';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = TASKS.find(t => t.id === id) || TASKS[0];
  return NextResponse.json(task);
}
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const task = TASKS.find(t => t.id === id) || { id };
  return NextResponse.json({ ...task, ...body });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ success: true, id });
}
