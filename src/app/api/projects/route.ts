import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  let query = supabaseServer.from("projects").select("*");
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // If no workspace_id provided, find first workspace or create one to avoid FK violation
    let workspaceId = body.workspace_id;
    if (!workspaceId) {
      const { data: workspaces } = await supabaseServer.from("workspaces").select("id").limit(1);
      if (workspaces && workspaces.length > 0) {
        workspaceId = workspaces[0].id;
      } else {
        const { data: newWS, error: wsErr } = await supabaseServer.from("workspaces").insert([{ name: "Default Workspace" }]).select().single();
        if (wsErr) throw wsErr;
        workspaceId = newWS.id;
      }
    }

    const projectData = {
      workspace_id: workspaceId,
      name: body.name,
      description: body.description || "",
      status: body.status || "Active",
    };

    const { data, error } = await supabaseServer.from("projects").insert([projectData]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
