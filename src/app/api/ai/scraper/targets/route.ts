import { NextResponse } from 'next/server';
import { dbHelper } from '@/lib/dbHelper';

export async function GET() {
  try {
    const targets = await dbHelper.getScraperTargets();
    return NextResponse.json({ success: true, targets });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, category = 'general', check_interval = 'daily' } = body;
    
    if (!name || !url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const target = await dbHelper.createScraperTarget({ name, url, category, check_interval });
    return NextResponse.json({ success: true, target }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Target ID is required' }, { status: 400 });
    }

    await dbHelper.deleteScraperTarget(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
