import { NextResponse } from "next/server";
import { discordConnector } from "@/integrations/discord/webhook";

export async function POST(request: Request) {
  try {
    const { webhookUrl, content } = await request.json();
    const res = await discordConnector.postToWebhook(webhookUrl, content);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
