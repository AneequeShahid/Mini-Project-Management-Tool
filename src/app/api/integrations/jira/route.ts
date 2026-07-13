import { NextResponse } from "next/server";
import { jiraConnector } from "@/integrations/jira/sync";

export async function POST(request: Request) {
  try {
    const { workspaceId } = await request.json();
    const res = await jiraConnector.importStories(workspaceId);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
