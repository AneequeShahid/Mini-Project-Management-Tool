import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project") || undefined;
    const sprintId = searchParams.get("sprint") || undefined;
    const assigneeId = searchParams.get("assignee") || undefined;

    const data = await dbHelper.getTasks(projectId, sprintId, assigneeId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.project_id && !body.project) {
      return NextResponse.json({ error: "project_id is required" }, { status: 400 });
    }

    const taskData = {
      project_id: body.project_id || body.project,
      sprint_id: body.sprint_id || body.sprint || null,
      title: body.title,
      description: body.description || "",
      status: body.status || "Todo",
      priority: body.priority || "Medium",
      story_points: body.storyPoints || body.story_points || 0,
      assignee_id: body.assignee_id || body.assignee || null,
      blocked_by: body.blocked_by || body.blockedBy || null,
      due_date: body.dueDate || body.due_date || null,
      work_item_type_id: body.work_item_type_id || null,
      custom_fields: body.custom_fields || {},
      document_content: body.document_content || ""
    };

    const data = await dbHelper.createTask(taskData);
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
