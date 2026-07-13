import { NextResponse } from "next/server";
import { EventBus } from "@/lib/eventBus";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = request.headers.get("x-github-event") || "push";

    console.log(`[Webhook] Github event received: ${event}`, body);

    // Publish to local Event Bus
    await EventBus.publish({
      action: `GITHUB_${event.toUpperCase()}`,
      details: {
        sender: body.sender?.login || "github-agent",
        repository: body.repository?.full_name || "mini-project-management-tool",
        commit: body.commits?.[0]?.message || "Sync update changes",
        ref: body.ref || "refs/heads/main",
      }
    });

    return NextResponse.json({
      success: true,
      message: "Webhook event parsed and dispatched to Event Bus.",
      workflowTriggered: "n8n_github_sync_flow",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
