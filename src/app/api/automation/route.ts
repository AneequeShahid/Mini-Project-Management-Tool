import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const { action, workflowId, payload } = await request.json();

    if (action === "trigger") {
      const { data: workflow, error } = await supabaseServer.from("workflows").select("*").eq("id", workflowId).single();
      if (error || !workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

      // Insert execution history log
      const { data: history } = await supabaseServer.from("workflow_history").insert([
        {
          workflow_id: workflowId,
          status: "Success",
          payload,
        }
      ]).select().single();

      return NextResponse.json({
        success: true,
        history,
        message: `Workflow "${workflow.name}" triggered successfully.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
