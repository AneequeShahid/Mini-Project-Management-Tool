import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import OpenAI from "openai";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  const { data, error } = await supabaseServer.from("adrs").select("*").eq("project_id", projectId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const { projectId, prompt } = await request.json();
    if (!projectId || !prompt) return NextResponse.json({ error: "projectId and prompt are required" }, { status: 400 });

    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "dummy-key";
    const baseURL = process.env.AI_API_URL || "https://openrouter.ai/api/v1";
    const client = new OpenAI({ apiKey, baseURL });

    const systemPrompt = "You are the Architect Agent. Your job is to write a detailed Architecture Decision Record (ADR) in markdown format with sections: Title, Status (Proposed), Context, Decision, and Consequences. Be brief, structural, and professional.";
    const response = await client.chat.completions.create({
      model: process.env.AI_MODEL || "qwen/qwen-2.5-7b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Write an ADR for: ${prompt}` }
      ]
    });

    const content = response.choices[0].message.content || "";

    const titleMatch = content.match(/#\s*(.*)/) || content.match(/Title:\s*(.*)/) || content.match(/##\s*(.*)/);
    const title = titleMatch ? titleMatch[1].trim() : `ADR: ${prompt.slice(0, 30)}`;

    const { data, error } = await supabaseServer.from("adrs").insert([
      {
        project_id: projectId,
        title,
        content,
        status: "Proposed"
      }
    ]).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    const { data, error } = await supabaseServer.from("adrs").update({ status }).eq("id", id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
