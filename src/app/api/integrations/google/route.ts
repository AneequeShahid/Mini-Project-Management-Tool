import { NextResponse } from "next/server";
import { googleCalendarConnector } from "@/integrations/google/calendar";

export async function POST(request: Request) {
  try {
    const { action, workspaceId, credentials } = await request.json();

    if (action === "connect") {
      const res = await googleCalendarConnector.connect(workspaceId, credentials);
      return NextResponse.json(res);
    }

    if (action === "sync") {
      const res = await googleCalendarConnector.sync(workspaceId);
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
