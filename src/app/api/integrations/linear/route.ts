import { NextResponse } from "next/server";
import { linearConnector } from "@/integrations/linear/sync";

export async function POST(request: Request) {
  try {
    const { workspaceId } = await request.json();
    const res = await linearConnector.importIssues(workspaceId);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
