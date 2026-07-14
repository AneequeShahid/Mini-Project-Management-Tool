import { NextResponse } from 'next/server';
import { OBSERVABILITY_DATA } from '@/lib/data';
export async function GET() { return NextResponse.json(OBSERVABILITY_DATA); }
