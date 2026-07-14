import { NextResponse } from 'next/server';
import { TIMELINE_EVENTS } from '@/lib/data';
export async function GET() { return NextResponse.json({ events: TIMELINE_EVENTS }); }
