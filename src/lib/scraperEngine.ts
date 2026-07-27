import OpenAI from 'openai';

export interface ScrapeResult {
  url: string;
  label: string;
  status: 'success' | 'failed';
  cleaned_text: string;
  full_text: string;
  text_length: number;
  hash: string;
  title: string;
  meta_description: string;
  scraped_at: string;
  error?: string;
}

export interface DiffResult {
  added_lines: string[];
  removed_lines: string[];
  added_count: number;
  removed_count: number;
  change_ratio: number; // 0-1
}

export interface AIAnalysis {
  change_detected: boolean;
  category: string; // 'pricing' | 'features' | 'content' | 'layout' | 'minor' | 'unknown'
  summary: string;
  confidence_score: number; // 0-1
  key_changes: string[];
  extracted_data?: {
    product_name?: string;
    price?: string;
    features?: string[];
    headings?: string[];
    links_count?: number;
    images_count?: number;
  };
}

async function fetchPage(url: string, retries: number = 2): Promise<string> {
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': userAgent },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  throw lastError;
}

function cleanHtml(html: string): string {
  // Strip tags and their contents
  let cleaned = html.replace(/<(script|style|meta|link|svg|noscript|iframe)[^>]*>[\s\S]*?<\/\1>/gi, '');
  
  // Strip self-closing tags like meta and link
  cleaned = cleaned.replace(/<(meta|link)[^>]*>/gi, '');

  // Strip HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Strip remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // Decode common HTML entities
  const entities: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  cleaned = cleaned.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/gi, match => entities[match.toLowerCase()] || match);

  // Normalize whitespace
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');

  return cleaned;
}

function extractMeta(html: string): { title: string; description: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = html.match(/<meta[^>]+(?:name="description"|property="og:description")[^>]+content="([^"]+)"[^>]*>/i) ||
                    html.match(/<meta[^>]+content="([^"]+)"[^>]+(?:name="description"|property="og:description")[^>]*>/i);
  const description = descMatch ? descMatch[1].trim() : '';

  return { title, description };
}

async function computeHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function computeDiff(oldText: string, newText: string): DiffResult {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);
  
  const added_lines = newLines.filter(line => !oldSet.has(line));
  const removed_lines = oldLines.filter(line => !newSet.has(line));
  
  const total_old_lines = oldLines.length || 1;
  const change_ratio = (added_lines.length + removed_lines.length) / total_old_lines;
  
  return {
    added_lines,
    removed_lines,
    added_count: added_lines.length,
    removed_count: removed_lines.length,
    change_ratio,
  };
}

async function analyzeWithAI(url: string, removed: string, added: string): Promise<AIAnalysis> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI();
      const prompt = `Analyze the difference between the old and new content of ${url}.
Added content:
${added}

Removed content:
${removed}

Return a JSON object matching this TypeScript interface:
{
  "change_detected": boolean,
  "category": "pricing" | "features" | "content" | "layout" | "minor" | "unknown",
  "summary": "string",
  "confidence_score": number, // 0-1
  "key_changes": ["string"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      if (response.choices[0].message.content) {
        return JSON.parse(response.choices[0].message.content) as AIAnalysis;
      }
    } catch (error) {
      console.error('OpenAI analysis failed', error);
    }
  }

  // Fallback
  const change_detected = added.length > 0 || removed.length > 0;
  let category = 'unknown';
  const lowerAdded = added.toLowerCase();
  
  if (lowerAdded.includes('price') || lowerAdded.includes('$') || lowerAdded.includes('month')) {
    category = 'pricing';
  } else if (lowerAdded.includes('feature') || lowerAdded.includes('new')) {
    category = 'features';
  } else if (change_detected) {
    category = 'content';
  }

  return {
    change_detected,
    category,
    summary: change_detected ? 'Changes detected in content' : 'No significant changes',
    confidence_score: 0.5,
    key_changes: change_detected ? ['Text content updated'] : [],
  };
}

async function extractStructured(url: string, cleanedText: string): Promise<AIAnalysis['extracted_data']> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI();
      const prompt = `Extract structured data from the following webpage text from ${url}.
Text:
${cleanedText.substring(0, 5000)}

Return a JSON object matching this structure:
{
  "product_name": "string (optional)",
  "price": "string (optional)",
  "features": ["string"] (optional),
  "headings": ["string"] (optional)
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      if (response.choices[0].message.content) {
        return JSON.parse(response.choices[0].message.content);
      }
    } catch (error) {
      console.error('OpenAI extraction failed', error);
    }
  }

  // Fallback extraction
  const priceMatch = cleanedText.match(/\$\d+(\.\d{2})?|Rs\.\s?\d+(,\d{3})*/i);
  const price = priceMatch ? priceMatch[0] : undefined;
  
  const headings = cleanedText.split('\n').slice(0, 5).filter(l => l.length < 100);

  return {
    price,
    headings,
  };
}

async function scrapeUrl(url: string, label: string = ''): Promise<ScrapeResult> {
  try {
    const html = await fetchPage(url);
    const cleaned_text = cleanHtml(html);
    const { title, description } = extractMeta(html);
    const hash = await computeHash(cleaned_text);

    return {
      url,
      label,
      status: 'success',
      cleaned_text,
      full_text: html,
      text_length: cleaned_text.length,
      hash,
      title,
      meta_description: description,
      scraped_at: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      url,
      label,
      status: 'failed',
      cleaned_text: '',
      full_text: '',
      text_length: 0,
      hash: '',
      title: '',
      meta_description: '',
      scraped_at: new Date().toISOString(),
      error: error.message || 'Unknown error',
    };
  }
}

export const scraperEngine = {
  fetchPage,
  cleanHtml,
  extractMeta,
  computeHash,
  computeDiff,
  analyzeWithAI,
  extractStructured,
  scrapeUrl,
};
