import { NextResponse } from "next/server";
import { EventBus } from "@/lib/eventBus";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const source = request.headers.get("x-webhook-source") || "generic";

    await EventBus.publish({
      action: `WEBHOOK_${source.toUpperCase()}_RECEIVED`,
      details: body,
    });

    return NextResponse.json({ success: true, message: "Webhook event published onto event bus." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
