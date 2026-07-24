import { NextResponse } from "next/server";
import { googleCalendarConnector } from "@/integrations/google/calendar";
import { CALENDAR_EVENTS } from "@/lib/data";
import { workspaceRuntime } from "@/lib/workspaceRuntime";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || "default-workspace-id";

    if (!process.env.GOOGLE_CLIENT_ID) return NextResponse.json(workspaceRuntime.events);
    const res = await googleCalendarConnector.sync(workspaceId);
    if (!res.success) {
      // Return empty array if not configured/failed
      return NextResponse.json(workspaceRuntime.events);
    }
    return NextResponse.json(res.events?.length ? res.events : workspaceRuntime.events);
  } catch (err: any) {
    return NextResponse.json(workspaceRuntime.events);
  }
}

export async function POST(request: Request) {
  try {
    const { summary, description, startTime, endTime, workspaceId = "default-workspace-id" } = await request.json();

    if (!summary || !startTime || !endTime) {
      return NextResponse.json({ error: "summary, startTime, and endTime are required" }, { status: 400 });
    }

    try {
      if (!process.env.GOOGLE_CLIENT_ID) throw new Error("Google Calendar not configured");
      const res = await googleCalendarConnector.createEvent(workspaceId, summary, description, startTime, endTime);
      return NextResponse.json(res);
    } catch {
      // Fallback: Generate structured prototype payload if credentials are not configured yet
      const simulatedEventId = `local-${crypto.randomUUID()}`;
      const simulatedMeetLink = `https://meet.jit.si/pulse-${simulatedEventId.slice(-8)}`;
      const event = { id: simulatedEventId, title: summary, description, startTime, endTime, provider: 'local' as const, link: simulatedMeetLink, meetLink: simulatedMeetLink, attendees: [] as string[] };
      workspaceRuntime.events.unshift(event);

      return NextResponse.json({
        ...event,
        message: "Local calendar event scheduled. Connect Google Calendar later to sync it externally.",
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
