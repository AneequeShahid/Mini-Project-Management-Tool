import { CALENDAR_EVENTS, MEETINGS } from '@/lib/data';

type LocalEvent = { id: string; title: string; description?: string; startTime: string; endTime: string; provider: 'local' | 'zoom'; link?: string; meetLink?: string; attendees?: string[] };
type LocalIntegration = { id: string; workspace_id: string; provider: string; status: 'connected'; mode: 'local' | 'remote'; created_at: string; settings?: Record<string, unknown> };

const runtime = globalThis as typeof globalThis & { gravityRuntime?: { events: LocalEvent[]; meetings: typeof MEETINGS; integrations: LocalIntegration[] } };

export const workspaceRuntime = runtime.gravityRuntime ??= {
  events: CALENDAR_EVENTS.map((event) => ({ id: event.id, title: event.title, description: event.description, startTime: `${event.date}T${event.time}:00`, endTime: `${event.date}T${event.time}:00`, provider: 'local' as const, attendees: event.attendees })),
  meetings: [...MEETINGS],
  integrations: ['google', 'zoom', 'slack', 'github', 'vercel', 'notion', 'figma', 'microsoft-teams'].map((provider) => ({ id: `local-${provider}`, workspace_id: 'default-workspace-id', provider, status: 'connected' as const, mode: 'local' as const, created_at: '2026-07-13T12:00:00Z' })),
};

export function scheduleLocalMeeting(input: { title: string; date: string; time: string; duration?: string; type?: string; attendees?: number }) {
  const id = `local-${crypto.randomUUID()}`;
  const startTime = `${input.date}T${input.time || '09:00'}:00`;
  const durationMinutes = Number.parseInt(input.duration || '30', 10) || 30;
  const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60_000).toISOString();
  const room = input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const joinUrl = `https://meet.jit.si/gravity-${room}-${id.slice(-6)}`;
  const meeting = { id, title: input.title, type: input.type || 'meeting', date: input.date, time: input.time, duration: input.duration || '30 min', attendees: input.attendees || 1, status: 'upcoming', recording: false, summary: null, provider: 'local', join_url: joinUrl };
  workspaceRuntime.meetings.unshift(meeting);
  workspaceRuntime.events.unshift({ id, title: input.title, description: 'Scheduled with Gravity local meeting mode.', startTime, endTime, provider: 'local', link: joinUrl, meetLink: joinUrl, attendees: [] as string[] });
  return meeting;
}
