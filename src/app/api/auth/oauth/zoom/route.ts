import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId") || "default-workspace-id";

  const clientId = process.env.ZOOM_CLIENT_ID || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/oauth/callback`;

  const state = JSON.stringify({ workspaceId, provider: "zoom" });

  const url = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(url);
}
