import { NextResponse } from 'next/server';
import { EventBus } from '@/lib/eventBus';

const DEFAULT_COMPETITORS = [
  { name: 'Linear', url: 'https://linear.app', color: '#5e6ad2' },
  { name: 'Height', url: 'https://height.app', color: '#FF6B6B' },
  { name: 'ClickUp', url: 'https://clickup.com', color: '#7B68EE' },
  { name: 'Notion', url: 'https://notion.so', color: '#000000' },
  { name: 'Jira', url: 'https://www.atlassian.com/software/jira', color: '#0052cc' },
  { name: 'Asana', url: 'https://asana.com', color: '#F06A6A' },
];

function cleanHtml(html: string): string {
  let text = html;
  text = text.replace(/<script[\\s\\S]*?<\\/script>/gi, '');
  text = text.replace(/<style[\\s\\S]*?<\\/style>/gi, '');
  text = text.replace(/<noscript[\\s\\S]*?<\\/noscript>/gi, '');
  text = text.replace(/<svg[\\s\\S]*?<\\/svg>/gi, '');
  text = text.replace(/<iframe[\\s\\S]*?<\\/iframe>/gi, '');
  text = text.replace(/<!--[\\s\\S]*?-->/g, '');
  text = text.replace(/<[^>]+>/g, '\\n');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  const lines = text.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
  return lines.join('\\n');
}

export async function GET() {
  return NextResponse.json({ competitors: DEFAULT_COMPETITORS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const targets = body.urls
      ? body.urls.map((u: string) => ({ name: new URL(u).hostname, url: u, color: '#5B8CFF' }))
      : DEFAULT_COMPETITORS;

    const results = await Promise.allSettled(
      targets.map(async (target: any) => {
        try {
          const res = await fetch(target.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: AbortSignal.timeout(15000),
          });
          const html = await res.text();
          const cleaned = cleanHtml(html);
          return {
            name: target.name,
            url: target.url,
            color: target.color,
            status: 'success' as const,
            text_length: cleaned.length,
            preview: cleaned.slice(0, 300),
            scraped_at: new Date().toISOString(),
          };
        } catch (err: any) {
          return {
            name: target.name,
            url: target.url,
            color: target.color,
            status: 'failed' as const,
            text_length: 0,
            preview: `Error: ${err.message}`,
            scraped_at: new Date().toISOString(),
          };
        }
      })
    );

    const data = results.map(r => r.status === 'fulfilled' ? r.value : { name: 'Unknown', url: '', color: '#ef4444', status: 'failed', text_length: 0, preview: 'Promise rejected', scraped_at: new Date().toISOString() });

    await EventBus.publish({
      action: 'COMPETITOR_SCAN_COMPLETED',
      details: { scannedCount: data.length, successCount: data.filter(d => d.status === 'success').length },
    });

    return NextResponse.json({ success: true, count: data.length, results: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
