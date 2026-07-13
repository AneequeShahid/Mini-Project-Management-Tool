import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { data, error } = await supabaseServer.from("sprints").select("*").eq("project_id", projectId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const sprintData = {
      project_id: projectId,
      name: body.name,
      start_date: body.startDate || body.start_date,
      end_date: body.endDate || body.end_date,
      status: body.status || "Planned",
    };
    const { data, error } = await supabaseServer.from("sprints").insert([sprintData]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
