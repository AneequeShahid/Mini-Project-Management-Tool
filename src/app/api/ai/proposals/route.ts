import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { toolRegistry } from "@/lib/toolRegistry";

export async function GET(request: Request) {
  const { data, error } = await supabaseServer.from("proposals").select("*").eq("status", "Pending");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });

    if (status === "Approved") {
      const { data: proposal, error: fetchErr } = await supabaseServer.from("proposals").select("*").eq("id", id).single();
      if (fetchErr || !proposal) throw new Error("Proposal not found");

      const tool = (toolRegistry as any).tools.get(proposal.tool_name);
      if (!tool) throw new Error("Tool associated with proposal not found");
      
      const executionResult = await tool.execute(proposal.args);

      const { data: updated, error: updateErr } = await supabaseServer.from("proposals").update({ status }).eq("id", id).select().single();
      if (updateErr) throw updateErr;

      return NextResponse.json({ success: true, executionResult, updated });
    } else {
      const { data: updated, error: updateErr } = await supabaseServer.from("proposals").update({ status }).eq("id", id).select().single();
      if (updateErr) throw updateErr;
      return NextResponse.json({ success: true, updated });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
