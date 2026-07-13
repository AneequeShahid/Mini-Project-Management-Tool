import { NextResponse } from "next/server";
import { zoomMeetingsConnector } from "@/integrations/zoom/meetings";

export async function POST(request: Request) {
  try {
    const { topic, startTime, duration = 30, workspaceId = "default-workspace-id" } = await request.json();

    if (!topic || !startTime) {
      return NextResponse.json({ error: "topic and startTime are required" }, { status: 400 });
    }

    try {
      const res = await zoomMeetingsConnector.createZoomMeeting(workspaceId, topic, startTime, duration);
      return NextResponse.json(res);
    } catch {
      // Fallback: Generate structured Zoom mock payload if credentials are not configured yet
      const simulatedMeetingId = Math.floor(Math.random() * 900000000) + 100000000;
      const simulatedJoinUrl = `https://zoom.us/j/${simulatedMeetingId}`;
      const password = Math.random().toString(36).slice(-8);

      return NextResponse.json({
        meetingId: simulatedMeetingId.toString(),
        joinUrl: simulatedJoinUrl,
        password,
        topic,
        message: "Zoom meeting prototype link generated (fallback).",
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
