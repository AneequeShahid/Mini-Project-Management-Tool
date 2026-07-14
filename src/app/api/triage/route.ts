import { NextResponse } from 'next/server';
const TRIAGE_ITEMS = [
  { id: 'tri-1', title: 'Auth token refresh fails after 1hr idle', type: 'bug', priority: 'Critical', source: 'GitHub Issue #47', status: 'pending', created_at: '2026-07-13T08:00:00Z', assignee: null },
  { id: 'tri-2', title: 'Add SCIM provisioning for enterprise SSO', type: 'feature', priority: 'High', source: 'Customer Request', status: 'pending', created_at: '2026-07-12T14:00:00Z', assignee: null },
  { id: 'tri-3', title: 'Dashboard loads slowly on first visit', type: 'performance', priority: 'Medium', source: 'Internal QA', status: 'pending', created_at: '2026-07-11T10:00:00Z', assignee: null },
  { id: 'tri-4', title: 'Gantt chart overflows on mobile viewport', type: 'bug', priority: 'Low', source: 'User Report', status: 'triaged', created_at: '2026-07-10T09:00:00Z', assignee: 'TW' },
  { id: 'tri-5', title: 'Export sprint report to PDF', type: 'feature', priority: 'Medium', source: 'Customer Request', status: 'pending', created_at: '2026-07-09T11:00:00Z', assignee: null },
];
export async function GET() { return NextResponse.json(TRIAGE_ITEMS); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `tri-${Date.now()}`, ...body, status: 'pending', created_at: new Date().toISOString() }, { status: 201 });
}
