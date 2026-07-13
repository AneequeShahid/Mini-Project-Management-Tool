import { NextResponse } from "next/server";
import { microsoftTeamsConnector } from "@/integrations/microsoft/teams";

export async function POST(request: Request) {
  try {
    const { action, topic, startTime } = await request.json();

    if (action === "create_meeting") {
      const res = await microsoftTeamsConnector.createTeamsMeeting(topic, startTime);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
