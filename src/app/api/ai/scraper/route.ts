import { NextResponse } from 'next/server';
import { EventBus } from '@/lib/eventBus';

interface ScrapeResult {
  id: string;
  url: string;
  label: string;
  status: 'success' | 'failed';
  cleaned_text: string;
  text_length: number;
  hash: string;
  changed: boolean;
  diff_summary: { added_lines: number; removed_lines: number } | null;
  scraped_at: string;
}

const SCRAPE_HISTORY: ScrapeResult[] = [];
const CONTENT_STORE = new Map<string, { hash: string; content: string }>();

function cleanHtml(html: string): string {
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  text = text.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  text = text.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<[^>]+>/g, '\n');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return lines.join('\n');
}

async function computeHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function computeDiff(oldText: string, newText: string) {
  const oldLines = new Set(oldText.split('\n'));
  const newLines = new Set(newText.split('\n'));
  let added = 0, removed = 0;
  newLines.forEach(l => { if (!oldLines.has(l)) added++; });
  oldLines.forEach(l => { if (!newLines.has(l)) removed++; });
  return { added_lines: added, removed_lines: removed };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    count: SCRAPE_HISTORY.length,
    results: SCRAPE_HISTORY,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, label = 'Custom URL' } = body;
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

    let html: string;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        signal: AbortSignal.timeout(15000),
      });
      html = await res.text();
    } catch (fetchErr: any) {
      const failResult: ScrapeResult = {
        id: `scrape-${Date.now()}`,
        url, label, status: 'failed',
        cleaned_text: '', text_length: 0, hash: '',
        changed: false, diff_summary: null,
        scraped_at: new Date().toISOString(),
      };
      SCRAPE_HISTORY.unshift(failResult);
      return NextResponse.json(failResult, { status: 502 });
    }

    const cleaned = cleanHtml(html);
    const hash = await computeHash(cleaned);
    const previous = CONTENT_STORE.get(url);
    const changed = previous ? previous.hash !== hash : false;
    const diff = previous && changed ? computeDiff(previous.content, cleaned) : null;

    CONTENT_STORE.set(url, { hash, content: cleaned });

    const result: ScrapeResult = {
      id: `scrape-${Date.now()}`,
      url, label, status: 'success',
      cleaned_text: cleaned.slice(0, 500),
      text_length: cleaned.length,
      hash: hash.slice(0, 16),
      changed, diff_summary: diff,
      scraped_at: new Date().toISOString(),
    };

    SCRAPE_HISTORY.unshift(result);

    await EventBus.publish({
      action: 'WEB_SCRAPE_COMPLETED',
      details: { url, label, textLength: cleaned.length, changed },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
