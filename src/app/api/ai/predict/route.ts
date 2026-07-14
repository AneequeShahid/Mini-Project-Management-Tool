import { NextResponse } from 'next/server';
import { VELOCITY_DATA, BURNDOWN_DATA } from '@/lib/data';
export async function GET() {
  return NextResponse.json({ velocity: VELOCITY_DATA, burndown: BURNDOWN_DATA, prediction: { completion_probability: 0.73, expected_completion: '2026-07-20', risk_level: 'medium', blocked_count: 2, on_track_count: 12 } });
}
