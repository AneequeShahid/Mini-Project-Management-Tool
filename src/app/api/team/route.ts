import { NextResponse } from 'next/server';
import { ROLE_DEFINITIONS, TEAM_PERFORMANCE } from '@/lib/data';
import { can, getRequestRole } from '@/lib/roles';

export async function GET(request: Request) {
  const role = getRequestRole(request);
  const members = can(role, 'performance:view') || role === 'admin' || role === 'owner'
    ? TEAM_PERFORMANCE
    : TEAM_PERFORMANCE.map(({ ai_summary, delivery_score, quality_score, collaboration_score, growth_trend, ...member }) => member);
  return NextResponse.json({ currentRole: role, roles: ROLE_DEFINITIONS, members, permissions: ROLE_DEFINITIONS.find((item) => item.id === role)?.permissions || [] });
}

export async function PATCH(request: Request) {
  const actor = getRequestRole(request);
  if (!can(actor, 'members:manage')) return NextResponse.json({ error: 'Your role cannot manage member access.' }, { status: 403 });
  const { memberId, role } = await request.json();
  const member = TEAM_PERFORMANCE.find((item) => item.id === memberId);
  if (!member || !ROLE_DEFINITIONS.some((item) => item.id === role)) return NextResponse.json({ error: 'Invalid member or role.' }, { status: 400 });
  (member as any).access_role = role;
  return NextResponse.json(member);
}
