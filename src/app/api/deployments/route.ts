import { NextResponse } from 'next/server';
import { DEPLOYMENTS } from '@/lib/data';
export async function GET() { return NextResponse.json(DEPLOYMENTS); }
