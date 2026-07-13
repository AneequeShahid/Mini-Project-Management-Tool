import { supabaseServer } from "./supabaseServer";
import { encrypt, decrypt } from "./encryption";
import fs from "fs";
import path from "path";

const INTEGRATIONS_JSON_PATH = path.join(process.cwd(), "backup-integrations.json");

const isPlaceholder =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

// Local JSON fallback helpers
function readLocalIntegrations(): any[] {
  if (!fs.existsSync(INTEGRATIONS_JSON_PATH)) {
    fs.writeFileSync(INTEGRATIONS_JSON_PATH, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(INTEGRATIONS_JSON_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeLocalIntegrations(data: any[]) {
  fs.writeFileSync(INTEGRATIONS_JSON_PATH, JSON.stringify(data, null, 2));
}

export async function getDecryptedAccessToken(workspaceId: string, provider: string): Promise<string | null> {
  try {
    let integration: any = null;

    if (isPlaceholder) {
      const list = readLocalIntegrations();
      integration = list.find((x: any) => x.workspace_id === workspaceId && x.provider === provider);
    } else {
      const { data, error } = await supabaseServer
        .from("integrations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("provider", provider)
        .maybeSingle();

      if (error) {
        console.error("[TokenManager] Database query failed:", error.message);
      } else {
        integration = data;
      }
    }

    if (!integration || !integration.credentials?.accessToken) {
      console.warn(`[TokenManager] No active integration found for ${provider} in workspace ${workspaceId}`);
      return null;
    }

    const credentials = integration.credentials;
    const now = Date.now();

    // Check if token has expired or is expiring in next 60 seconds
    if (credentials.expiresAt && now > credentials.expiresAt - 60000) {
      console.log(`[TokenManager] Access token for ${provider} expired. Refreshing...`);
      return await refreshAccessToken(workspaceId, provider, credentials);
    }

    return decrypt(credentials.accessToken);
  } catch (err: any) {
    console.error("[TokenManager] Error fetching token:", err.message);
    return null;
  }
}

export async function saveOAuthTokens(workspaceId: string, provider: string, accessToken: string, refreshToken: string | null, expiresIn: number) {
  const expiresAt = Date.now() + expiresIn * 1000;
  const encryptedAccessToken = encrypt(accessToken);
  const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : "";

  if (isPlaceholder) {
    const list = readLocalIntegrations();
    const existingIndex = list.findIndex(x => x.workspace_id === workspaceId && x.provider === provider);
    const payload = {
      workspace_id: workspaceId,
      provider,
      credentials: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken || (existingIndex >= 0 ? list[existingIndex].credentials.refreshToken : ""),
        expiresAt,
      },
      settings: {},
      last_sync_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = payload;
    } else {
      list.push(payload);
    }
    writeLocalIntegrations(list);
  } else {
    // If there is existing record, merge tokens
    const { data: existing } = await supabaseServer
      .from("integrations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("provider", provider)
      .maybeSingle();

    const finalRefreshToken = encryptedRefreshToken || existing?.credentials?.refreshToken || "";

    const { error } = await supabaseServer.from("integrations").upsert([
      {
        workspace_id: workspaceId,
        provider,
        credentials: {
          accessToken: encryptedAccessToken,
          refreshToken: finalRefreshToken,
          expiresAt,
        },
        last_sync_at: new Date().toISOString(),
      }
    ]);

    if (error) {
      throw new Error(`DB Token save failed: ${error.message}`);
    }
  }
}

async function refreshAccessToken(workspaceId: string, provider: string, credentials: any): Promise<string | null> {
  if (!credentials.refreshToken) {
    console.warn(`[TokenManager] Cannot refresh ${provider} - no refresh token stored.`);
    return null;
  }

  const decryptedRefresh = decrypt(credentials.refreshToken);

  try {
    let newAccessToken = "";
    let newRefreshToken = "";
    let expiresIn = 3600;

    if (provider === "google") {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          refresh_token: decryptedRefresh,
          grant_type: "refresh_token",
        }),
      });

      if (!res.ok) {
        throw new Error(`Google token refresh request failed: ${res.statusText}`);
      }

      const data = await res.json();
      newAccessToken = data.access_token;
      newRefreshToken = data.refresh_token || "";
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
          grant_type: "refresh_token",
          refresh_token: decryptedRefresh,
        }),
      });

      if (!res.ok) {
        throw new Error(`Zoom token refresh request failed: ${res.statusText}`);
      }

      const data = await res.json();
      newAccessToken = data.access_token;
      newRefreshToken = data.refresh_token || "";
      expiresIn = data.expires_in;
    } else {
      console.warn(`[TokenManager] Refresh token flow not supported for provider: ${provider}`);
      return null;
    }

    await saveOAuthTokens(workspaceId, provider, newAccessToken, newRefreshToken || decryptedRefresh, expiresIn);
    console.log(`[TokenManager] Successfully refreshed access token for ${provider}.`);
    return newAccessToken;
  } catch (err: any) {
    console.error(`[TokenManager] Failed to refresh ${provider} token:`, err.message);
    return null;
  }
}
