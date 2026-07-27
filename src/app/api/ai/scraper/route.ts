import { NextResponse } from 'next/server';
import { EventBus } from '@/lib/eventBus';
import { dbHelper } from '@/lib/dbHelper';
import { scraperEngine } from '@/lib/scraperEngine';

export async function GET() {
  try {
    const history = await dbHelper.getScraperSnapshots();
    return NextResponse.json({
      success: true,
      count: history.length,
      results: history,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, label = 'Custom URL' } = body;
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    const scrapeResult = await scraperEngine.scrapeUrl(url, label);
    if (scrapeResult.status === 'failed') {
      return NextResponse.json(scrapeResult, { status: 502 });
    }

    const previous = await dbHelper.getLatestSnapshot(url);
    const hash = await scraperEngine.computeHash(scrapeResult.cleaned_text);
    const changed = previous ? previous.hash !== hash : false;
    
    let diff = null;
    let aiAnalysis = null;
    
    if (changed && previous) {
      diff = scraperEngine.computeDiff(previous.cleaned_text, scrapeResult.cleaned_text);
      aiAnalysis = await scraperEngine.analyzeWithAI(url, diff.removed_lines.join('\n'), diff.added_lines.join('\n'));
      await dbHelper.saveScraperAlert({
        url,
        label,
        diff_summary: diff,
        ai_analysis: aiAnalysis,
      });
    }

    const snapshot = {
      ...scrapeResult,
      hash,
      changed,
      diff_summary: diff,
      ai_analysis: aiAnalysis
    };

    await dbHelper.saveScraperSnapshot(snapshot);

    await EventBus.publish({
      action: 'WEB_SCRAPE_COMPLETED',
      details: { url, label, textLength: scrapeResult.text_length, changed },
    });

    return NextResponse.json(snapshot, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
