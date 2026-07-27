import { NextResponse } from 'next/server';
import { EventBus } from '@/observability/eventBus';
import { dbHelper } from '@/lib/dbHelper';
import { scraperEngine } from '@/services/scraper';

export async function GET() {
  try {
    const targets = await dbHelper.getScraperTargets();
    const competitors = targets.filter((t: any) => t.category === 'competitor');
    return NextResponse.json({ competitors });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let urls = body.urls;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      const targets = await dbHelper.getScraperTargets();
      urls = targets.filter((t: any) => t.category === 'competitor').map((t: any) => t.url);
    }

    if (!urls || urls.length === 0) {
      return NextResponse.json({ success: true, count: 0, results: [] });
    }

    const results = await Promise.allSettled(
      urls.map((url: string) => scraperEngine.scrapeUrl(url))
    );

    const data = results.map((r: any, idx: number) => {
      if (r.status === 'fulfilled') return r.value;
      return { 
        url: urls[idx], 
        status: 'failed', 
        error: r.reason?.message || 'Promise rejected',
        scraped_at: new Date().toISOString()
      };
    });

    // Brief AI summary comparison if OpenAI is available
    let aiComparison = null;
    try {
      const successfulScrapes = data.filter((d: any) => d.status === 'success');
      if (successfulScrapes.length > 0 && typeof (scraperEngine as any).compareCompetitors === 'function') {
         aiComparison = await (scraperEngine as any).compareCompetitors(successfulScrapes);
      }
    } catch (e) {
      // Ignore AI comparison errors
    }

    await EventBus.publish({
      action: 'COMPETITOR_SCAN_COMPLETED',
      details: { scannedCount: data.length, successCount: data.filter((d: any) => d.status === 'success').length },
    });

    return NextResponse.json({ success: true, count: data.length, results: data, aiComparison }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
