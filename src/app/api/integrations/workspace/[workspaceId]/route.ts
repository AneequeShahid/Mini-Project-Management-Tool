import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const { data, error } = await supabaseServer.from("integrations").select("*").eq("workspace_id", workspaceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await params;
    const body = await request.json();
    const integrationData = {
      workspace_id: workspaceId,
      provider: body.provider,
      credentials: body.credentials || {},
      settings: body.settings || {},
    };
    const { data, error } = await supabaseServer.from("integrations").insert([integrationData]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
