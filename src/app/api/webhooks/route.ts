import { NextResponse } from 'next/server';
const WEBHOOKS = [
  { id: 'wh-1', name: 'Vercel Deploy Hook', url: 'https://api.vercel.com/v1/hooks/abc', events: ['deployment.created', 'deployment.succeeded', 'deployment.failed'], status: 'active', last_triggered: '2 hr ago' },
  { id: 'wh-2', name: 'Slack Notification Hook', url: 'https://hooks.slack.com/services/xxx', events: ['task.created', 'sprint.completed'], status: 'active', last_triggered: '10 min ago' },
  { id: 'wh-3', name: 'Incident Webhook', url: 'https://events.pagerduty.com/xxx', events: ['deployment.failed', 'guardrail.triggered'], status: 'paused', last_triggered: '2 days ago' },
];
export async function GET() { return NextResponse.json(WEBHOOKS); }
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ id: `wh-${Date.now()}`, ...body, status: 'active', last_triggered: 'never' }, { status: 201 });
}
