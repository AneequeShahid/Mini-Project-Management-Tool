import { NextResponse } from "next/server";
import { slackConnector } from "@/integrations/slack/webhook";

export async function POST(request: Request) {
  try {
    const { channel, text, workspaceId = "default-workspace-id" } = await request.json();
    const res = await slackConnector.postMessage(workspaceId, channel, text);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
