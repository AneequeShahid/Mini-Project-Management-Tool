import { NextResponse } from "next/server";
import { zoomMeetingsConnector } from "@/integrations/zoom/meetings";
import { scheduleLocalMeeting } from "@/lib/workspaceRuntime";

export async function POST(request: Request) {
  try {
    const { topic, startTime, duration = 30, workspaceId = "default-workspace-id" } = await request.json();

    if (!topic || !startTime) {
      return NextResponse.json({ error: "topic and startTime are required" }, { status: 400 });
    }

    try {
      if (!process.env.ZOOM_CLIENT_ID) throw new Error("Zoom not configured");
      const res = await zoomMeetingsConnector.createZoomMeeting(workspaceId, topic, startTime, duration);
      return NextResponse.json(res);
    } catch {
      const date = startTime.slice(0, 10);
      const time = startTime.slice(11, 16) || "09:00";
      const meeting = scheduleLocalMeeting({ title: topic, date, time, duration: `${duration} min`, type: "video" });

      return NextResponse.json({
        meetingId: meeting.id,
        joinUrl: meeting.join_url,
        password: null,
        topic,
        provider: "local",
        message: "Local video room created. Add Zoom credentials later to create native Zoom meetings.",
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
