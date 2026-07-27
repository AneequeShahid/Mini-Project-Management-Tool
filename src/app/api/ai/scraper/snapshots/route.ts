import { NextResponse } from 'next/server';
import { dbHelper } from '@/lib/dbHelper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const urlFilter = searchParams.get('url');
    
    const snapshots = await dbHelper.getScraperSnapshots(urlFilter || undefined);
    return NextResponse.json({ success: true, snapshots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
