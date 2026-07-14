import { NextResponse } from 'next/server';
import { VELOCITY_DATA } from '@/lib/data';
export async function GET() {
  return NextResponse.json({
    velocity: VELOCITY_DATA,
    top_contributors: [
      { name: 'Aneeque Shahid', avatar: 'AS', tasks: 18, points: 64, prs: 22 },
      { name: 'Jordan Lee', avatar: 'JL', tasks: 14, points: 48, prs: 15 },
      { name: 'Maria Kim', avatar: 'MK', tasks: 12, points: 38, prs: 18 },
      { name: 'Ryan Park', avatar: 'RP', tasks: 11, points: 42, prs: 12 },
      { name: 'Taylor Wright', avatar: 'TW', tasks: 9, points: 28, prs: 8 },
    ],
    delivery_rate: 91,
    bugs_resolved: 14,
    avg_cycle_time_days: 2.4,
    total_prs_merged: 75,
    sprint_data: VELOCITY_DATA
  });
}
