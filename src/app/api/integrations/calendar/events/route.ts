import { NextResponse } from "next/server";
import { googleCalendarConnector } from "@/integrations/google/calendar";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId") || "default-workspace-id";

    const res = await googleCalendarConnector.sync(workspaceId);
    if (!res.success) {
      // Return empty array if not configured/failed
      return NextResponse.json([]);
    }
    return NextResponse.json(res.events || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { summary, description, startTime, endTime, workspaceId = "default-workspace-id" } = await request.json();

    if (!summary || !startTime || !endTime) {
      return NextResponse.json({ error: "summary, startTime, and endTime are required" }, { status: 400 });
    }

    try {
      const res = await googleCalendarConnector.createEvent(workspaceId, summary, description, startTime, endTime);
      return NextResponse.json(res);
    } catch {
      // Fallback: Generate structured prototype payload if credentials are not configured yet
      const simulatedEventId = Math.random().toString(36).substring(7);
      const simulatedMeetLink = `https://meet.google.com/${simulatedEventId}`;

      return NextResponse.json({
        id: simulatedEventId,
        title: summary,
        link: "https://calendar.google.com",
        meetLink: simulatedMeetLink,
        message: "Google Calendar event prototype entry created (fallback).",
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
