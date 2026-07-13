import { NextResponse } from "next/server";
import { notionConnector } from "@/integrations/notion/sync";

export async function POST(request: Request) {
  try {
    const { title, description, workspaceId = "default-workspace-id" } = await request.json();
    const res = await notionConnector.exportTaskToNotionPage(workspaceId, title, description);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
