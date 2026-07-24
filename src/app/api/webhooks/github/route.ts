import { NextResponse } from "next/server";
import { EventBus } from "@/lib/eventBus";
import { TASKS } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = request.headers.get("x-github-event") || "push";

    console.log(`[Webhook] Github event received: ${event}`, body);

    let linkedTaskId: string | null = null;
    let autoUpdatedTask: any = null;

    // Handle Pull Request Events
    if (event === "pull_request" || body.pull_request) {
      const pr = body.pull_request || {};
      const action = body.action || "opened";
      const prTitle = pr.title || "";
      const prBody = pr.body || "";
      const branch = pr.head?.ref || "";

      // Extract task ID patterns e.g. GRAV-123, tri-1, task-1, #47
      const textToSearch = `${prTitle} ${prBody} ${branch}`;
      const match = textToSearch.match(/(GRAV-\d+|tri-\d+|task-\d+|#\d+)/i);
      
      if (match) {
        linkedTaskId = match[0];
        const foundTask = TASKS.find(
          (t) => t.id.toLowerCase() === linkedTaskId?.toLowerCase() || t.title.toLowerCase().includes(linkedTaskId?.toLowerCase() || "")
        );

        if (foundTask) {
          if (action === "closed" && pr.merged) {
            foundTask.status = "Done";
          } else if (action === "opened" || action === "reopened") {
            foundTask.status = "In Review";
          }
          autoUpdatedTask = foundTask;
        }
      }

      await EventBus.publish({
        action: `GITHUB_PR_${action.toUpperCase()}`,
        details: {
          sender: body.sender?.login || pr.user?.login || "github-agent",
          repository: body.repository?.full_name || "mini-project-management-tool",
          prNumber: pr.number,
          prTitle: pr.title,
          action,
          merged: pr.merged || false,
          linkedTaskId,
          taskStatus: autoUpdatedTask ? autoUpdatedTask.status : null,
        },
      });

      return NextResponse.json({
        success: true,
        event: "pull_request",
        action,
        linkedTaskId,
        taskUpdated: autoUpdatedTask ? { id: autoUpdatedTask.id, status: autoUpdatedTask.status } : null,
        message: `GitHub pull_request.${action} processed and dispatched to Event Bus.`,
      });
    }

    // Default Push / Repository Event fallback
    await EventBus.publish({
      action: `GITHUB_${event.toUpperCase()}`,
      details: {
        sender: body.sender?.login || "github-agent",
        repository: body.repository?.full_name || "mini-project-management-tool",
        commit: body.commits?.[0]?.message || "Sync update changes",
        ref: body.ref || "refs/heads/main",
      },
    });

    return NextResponse.json({
      success: true,
      event,
      message: "Webhook event parsed and dispatched to Event Bus.",
      workflowTriggered: "github_sync_flow",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
