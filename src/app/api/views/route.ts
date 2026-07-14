import { NextResponse } from 'next/server';
const SAVED_VIEWS = [
  { id: 'view-1', name: 'Sprint 12 Board', type: 'Kanban', query: { filterStatus: 'all', filterPriority: 'all', groupBy: 'status', sortBy: 'due_date', selectedProject: 'proj-1' } },
  { id: 'view-2', name: 'Critical Bugs', type: 'List', query: { filterStatus: 'all', filterPriority: 'Critical', groupBy: 'status', sortBy: 'due_date', selectedProject: 'proj-1' } },
];
export async function GET() { return NextResponse.json(SAVED_VIEWS); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `view-${Date.now()}`, ...body }, { status: 201 });
}
