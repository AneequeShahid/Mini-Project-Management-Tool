import { NextResponse } from 'next/server';
import { MEMORY_NODES } from '@/lib/data';
export async function GET() {
  return NextResponse.json({ nodes: MEMORY_NODES, total: MEMORY_NODES.length, indexed_docs: 6242, vector_status: 'ready', last_sync: new Date().toISOString() });
}
export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ query: body.query, results: MEMORY_NODES.slice(0, 3), latency_ms: 142 });
}
