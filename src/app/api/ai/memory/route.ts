import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) return NextResponse.json({ error: "prompt is required" }, { status: 400 });

    const { data: adrs = [] } = await supabaseServer.from("adrs").select("*");
    const { data: logs = [] } = await supabaseServer.from("audit_trail").select("*");

    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "dummy-key";
    const baseURL = process.env.AI_API_URL || "https://openrouter.ai/api/v1";
    const client = new OpenAI({ apiKey, baseURL });

    const systemPrompt = "You are Gravity's Engineering Memory System. Your job is to explain the context of engineering changes, database shifts, and developer decisions based on the project's ADRs and Audit Logs. Tie everything together: who approved it, which ADR covers it, and which service was affected. Be structural and precise.";
    
    const response = await client.chat.completions.create({
      model: "qwen/qwen-2.5-7b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Prompt: ${prompt}\n\nProject Data:\nADRs:\n${JSON.stringify(adrs)}\n\nAudit Logs:\n${JSON.stringify(logs)}` }
      ]
    });

    return NextResponse.json({
      explanation: response.choices[0].message.content || "No records found.",
      referencedAdrs: adrs || [],
      timelineEventsCount: (logs || []).length
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
