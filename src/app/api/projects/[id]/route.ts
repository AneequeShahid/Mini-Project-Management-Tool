import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { PROJECTS } from "@/lib/data";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const project = PROJECTS.find((item) => item.id === id);
    return project ? NextResponse.json(project) : NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const { data, error } = await supabaseServer.from("projects").select("*").eq("id", id).single();
  return NextResponse.json(error || !data ? PROJECTS.find((item) => item.id === id) : data, { status: error || !data ? 404 : 200 });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, error } = await supabaseServer.from("projects").update(body).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabaseServer.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Project deleted" });
}
