import { NextResponse } from 'next/server';
import { dbHelper } from '@/lib/dbHelper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    const snapshots = await dbHelper.getScraperSnapshots();

    if (format === 'csv') {
      const headers = ['url', 'label', 'status', 'text_length', 'hash', 'scraped_at'];
      
      const csvRows = [];
      csvRows.push(headers.join(','));
      
      for (const row of snapshots) {
        const values = headers.map(header => {
          const val = row[header];
          const escaped = ('' + (val || '')).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      
      const csvString = csvRows.join('\n');
      
      return new NextResponse(csvString, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=scraper-export.csv',
        },
      });
    }

    return NextResponse.json({ success: true, count: snapshots.length, snapshots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
