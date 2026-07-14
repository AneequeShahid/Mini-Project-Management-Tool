import { NextResponse } from 'next/server';
import { DELIVERY_FORECAST, TEAM_PERFORMANCE } from '@/lib/data';
import { can, getRequestRole } from '@/lib/roles';

export async function GET(request: Request) {
  const role = getRequestRole(request);
  if (!can(role, 'performance:view')) return NextResponse.json({ error: 'Performance intelligence is available to managers and above.' }, { status: 403 });
  const teamAverage = Math.round(TEAM_PERFORMANCE.reduce((sum, member) => sum + member.delivery_score, 0) / TEAM_PERFORMANCE.length);
  return NextResponse.json({ generatedAt: new Date().toISOString(), methodology: 'Delivery signals are heuristic demo indicators—not HR decisions.', teamAverage, members: TEAM_PERFORMANCE, forecast: DELIVERY_FORECAST });
}
