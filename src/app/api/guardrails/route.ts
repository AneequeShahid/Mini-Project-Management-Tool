import { NextResponse } from 'next/server';
import { GUARDRAILS } from '@/lib/data';
export async function GET() { return NextResponse.json(GUARDRAILS); }
