import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    let query = supabaseServer.from("workflows").select("*");
    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { workspaceId, name, triggerType, actions } = await request.json();

    const { data, error } = await supabaseServer.from("workflows").insert([
      { workspace_id: workspaceId, name, trigger_type: triggerType, actions, active: true }
    ]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
