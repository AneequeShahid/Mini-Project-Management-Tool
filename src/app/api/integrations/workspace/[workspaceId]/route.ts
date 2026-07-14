import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { workspaceRuntime } from "@/lib/workspaceRuntime";

export async function GET(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return NextResponse.json(workspaceRuntime.integrations.filter((item) => item.workspace_id === workspaceId));
  const { data, error } = await supabaseServer.from("integrations").select("*").eq("workspace_id", workspaceId);
  return NextResponse.json(error ? workspaceRuntime.integrations.filter((item) => item.workspace_id === workspaceId) : data);
}

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await params;
    const body = await request.json();
    if (!body.provider) return NextResponse.json({ error: "provider is required" }, { status: 400 });
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const existing = workspaceRuntime.integrations.find((item) => item.workspace_id === workspaceId && item.provider === body.provider);
      const integration = existing || { id: `local-${crypto.randomUUID()}`, workspace_id: workspaceId, provider: body.provider, status: 'connected' as const, mode: body.mode === 'remote' ? 'remote' as const : 'local' as const, created_at: new Date().toISOString(), settings: body.settings || {} };
      if (!existing) workspaceRuntime.integrations.push(integration as any);
      return NextResponse.json(integration, { status: 201 });
    }
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
