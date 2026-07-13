import { NextResponse } from "next/server";
import { dbHelper } from "@/lib/dbHelper";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await dbHelper.getTask(id);
    if (!data) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Support all potential camelCase / snake_case variants from frontend clients
    const updateData = {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      story_points: body.story_points !== undefined ? body.story_points : body.storyPoints,
      assignee_id: body.assignee_id !== undefined ? body.assignee_id : body.assignee,
      blocked_by: body.blocked_by !== undefined ? body.blocked_by : body.blockedBy,
      due_date: body.due_date !== undefined ? body.due_date : body.dueDate,
      sprint_id: body.sprint_id !== undefined ? body.sprint_id : body.sprint,
      work_item_type_id: body.work_item_type_id,
      custom_fields: body.custom_fields,
      document_content: body.document_content
    };

    // Filter out undefined keys to prevent erasing other data
    const cleanUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    const data = await dbHelper.updateTask(id, cleanUpdate);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await dbHelper.deleteTask(id);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
