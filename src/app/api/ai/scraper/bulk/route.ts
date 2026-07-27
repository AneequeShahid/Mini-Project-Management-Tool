import { NextResponse } from 'next/server';
import { EventBus } from '@/lib/eventBus';
import { dbHelper } from '@/lib/dbHelper';
import { scraperEngine } from '@/lib/scraperEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { urls } = body;
    
    if (!urls || !Array.isArray(urls)) {
      return NextResponse.json({ error: 'An array of urls is required' }, { status: 400 });
    }
    
    if (urls.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 URLs allowed per bulk request' }, { status: 400 });
    }

    const results = await Promise.allSettled(
      urls.map((url: string) => scraperEngine.scrapeUrl(url))
    );

    const data = await Promise.all(results.map(async (r: any, idx: number) => {
      if (r.status === 'fulfilled' && r.value.status === 'success') {
        const scrapeResult = r.value;
        await dbHelper.saveScraperSnapshot(scrapeResult);
        return scrapeResult;
      }
      return { 
        url: urls[idx], 
        status: 'failed', 
        error: r.reason?.message || r.value?.error || 'Failed to scrape',
        scraped_at: new Date().toISOString()
      };
    }));

    const successCount = data.filter((d: any) => d.status === 'success').length;

    await EventBus.publish({
      action: 'BULK_SCRAPE_COMPLETED',
      details: { totalUrls: urls.length, successCount },
    });

    return NextResponse.json({ success: true, count: data.length, results: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
