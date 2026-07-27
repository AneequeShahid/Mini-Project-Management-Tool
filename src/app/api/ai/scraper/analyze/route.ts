import { NextResponse } from 'next/server';
import { scraperEngine } from '@/lib/scraperEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const scrapeResult = await scraperEngine.scrapeUrl(url);
    if (scrapeResult.status === 'failed') {
      return NextResponse.json(scrapeResult, { status: 502 });
    }

    const structuredData = await scraperEngine.extractStructured(url, scrapeResult.cleaned_text);
    
    return NextResponse.json({
      success: true,
      scrape_data: scrapeResult,
      structured_extraction: structuredData
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
