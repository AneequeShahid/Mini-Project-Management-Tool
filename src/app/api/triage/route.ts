import { NextResponse } from 'next/server';
import { TASKS } from '@/lib/data';
import { EventBus } from '@/lib/eventBus';

const TRIAGE_ITEMS = [
  { id: 'tri-1', title: 'Auth token refresh fails after 1hr idle', type: 'bug', priority: 'Critical', source: 'GitHub Issue #47', status: 'pending', created_at: '2026-07-13T08:00:00Z', assignee: null, confidence: 0.95 },
  { id: 'tri-2', title: 'Add SCIM provisioning for enterprise SSO', type: 'feature', priority: 'High', source: 'Customer Request', status: 'pending', created_at: '2026-07-12T14:00:00Z', assignee: null, confidence: 0.88 },
  { id: 'tri-3', title: 'Dashboard loads slowly on first visit', type: 'performance', priority: 'Medium', source: 'Internal QA', status: 'pending', created_at: '2026-07-11T10:00:00Z', assignee: null, confidence: 0.82 },
  { id: 'tri-4', title: 'Gantt chart overflows on mobile viewport', type: 'bug', priority: 'Low', source: 'User Report', status: 'triaged', created_at: '2026-07-10T09:00:00Z', assignee: 'TW', confidence: 0.91 },
  { id: 'tri-5', title: 'Export sprint report to PDF', type: 'feature', priority: 'Medium', source: 'Customer Request', status: 'pending', created_at: '2026-07-09T11:00:00Z', assignee: null, confidence: 0.85 },
];

function computeTextSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const set2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (set1.size === 0 || set2.size === 0) return 0;
  
  let intersection = 0;
  set1.forEach(word => { if (set2.has(word)) intersection++; });
  const union = new Set([...set1, ...set2]).size;
  return Number((intersection / union).toFixed(2));
}

function detectPriority(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('crash') || lower.includes('fail') || lower.includes('security') || lower.includes('auth')) return 'Critical';
  if (lower.includes('slow') || lower.includes('error') || lower.includes('high') || lower.includes('sso')) return 'High';
  if (lower.includes('add') || lower.includes('feature') || lower.includes('export')) return 'Medium';
  return 'Low';
}

function detectAssignee(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('auth') || lower.includes('sso') || lower.includes('security')) return 'Alex Vance (Lead Architect)';
  if (lower.includes('gantt') || lower.includes('dashboard') || lower.includes('ui')) return 'Taylor White (Senior Frontend)';
  if (lower.includes('performance') || lower.includes('database')) return 'Morgan Lee (Backend Engineer)';
  return 'Unassigned';
}

export async function GET() {
  return NextResponse.json({
    success: true,
    count: TRIAGE_ITEMS.length,
    items: TRIAGE_ITEMS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, source = 'User Report', type = 'bug' } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required for triage.' }, { status: 400 });
    }

    const fullText = `${title} ${description || ''}`;

    // 1. Check for duplicates against existing backlog tasks and triage items
    let highestSimilarity = 0;
    let matchDetails: any = null;

    const allCandidates = [
      ...TRIAGE_ITEMS.map(t => ({ id: t.id, title: t.title, source: 'Triage' })),
      ...TASKS.map(t => ({ id: t.id, title: t.title, source: 'Backlog Task' })),
    ];

    for (const candidate of allCandidates) {
      const sim = computeTextSimilarity(title, candidate.title);
      if (sim > highestSimilarity) {
        highestSimilarity = sim;
        matchDetails = { ...candidate, similarity: sim };
      }
    }

    const isDuplicate = highestSimilarity >= 0.40;
    const priority = detectPriority(fullText);
    const suggestedAssignee = detectAssignee(fullText);

    const newItem = {
      id: `tri-${Date.now()}`,
      title,
      description,
      type,
      priority,
      source,
      status: isDuplicate ? 'duplicate_flagged' : 'pending',
      created_at: new Date().toISOString(),
      assignee: suggestedAssignee,
      confidence: 0.89,
      ai_triage: {
        is_duplicate: isDuplicate,
        similarity_score: highestSimilarity,
        matched_item: isDuplicate ? matchDetails : null,
        suggested_priority: priority,
        suggested_assignee: suggestedAssignee,
      },
    };

    TRIAGE_ITEMS.unshift(newItem);

    // Publish event
    await EventBus.publish({
      action: 'ISSUE_TRIAGED',
      details: {
        triageId: newItem.id,
        title,
        priority,
        isDuplicate,
        matchedId: matchDetails?.id || null,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
