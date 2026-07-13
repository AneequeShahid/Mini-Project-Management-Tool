import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId") || "default-workspace-id";

  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/oauth/callback`;

  // State parameter to pass workspaceId and provider mapping back
  const state = JSON.stringify({ workspaceId, provider: "google" });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(
    "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
  )}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

  return NextResponse.redirect(url);
}
