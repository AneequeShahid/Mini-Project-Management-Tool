import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { encrypt } from "@/lib/encryption";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const stateStr = searchParams.get("state");

    if (!code || !stateStr) {
      return NextResponse.json({ error: "Missing authentication parameters" }, { status: 400 });
    }

    const { workspaceId, provider } = JSON.parse(stateStr);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/oauth/callback`;

    let accessToken = "";
    let refreshToken = "";
    let expiresIn = 3600;

    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID || "";
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!res.ok) {
        throw new Error(`Google exchange error: ${res.statusText}`);
      }

      const data = await res.json();
      accessToken = data.access_token;
      refreshToken = data.refresh_token || "";
      expiresIn = data.expires_in;
    } else if (provider === "zoom") {
      const clientId = process.env.ZOOM_CLIENT_ID || "";
      const clientSecret = process.env.ZOOM_CLIENT_SECRET || "";
      const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      const res = await fetch("https://zoom.us/oauth/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      if (!res.ok) {
        throw new Error(`Zoom exchange error: ${res.statusText}`);
      }

      const data = await res.json();
      accessToken = data.access_token;
      refreshToken = data.refresh_token || "";
      expiresIn = data.expires_in;
    }

    // Encrypt security tokens before database write
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : "";

    // Save/Upsert connection credentials in integrations table
    const { error: dbErr } = await supabaseServer.from("integrations").upsert([
      {
        workspace_id: workspaceId || null,
        provider,
        credentials: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: Date.now() + (expiresIn * 1000),
        },
      }
    ]);

    if (dbErr) throw dbErr;

    // Redirect the user back to the Integrations dashboard center
    return NextResponse.redirect(`${appUrl}/dashboard/integrations?success=true`);
  } catch (err: any) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=${encodeURIComponent(err.message)}`);
  }
}
