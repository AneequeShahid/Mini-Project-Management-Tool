const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "";
const REALM = process.env.KEYCLOAK_REALM || "pmtool";
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "pmtool-client";
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || "";

export async function verifyToken(accessToken) {
  if (!KEYCLOAK_URL) return null;
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export async function introspectToken(accessToken) {
  if (!KEYCLOAK_URL) return null;
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token/introspect`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      token: accessToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function exchangeCode(code, redirectUri) {
  if (!KEYCLOAK_URL) return null;
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!res.ok) return null;
  return res.json();
}

export function getAuthUrl(redirectUri) {
  if (!KEYCLOAK_URL) return null;
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
  });
  return `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth?${params}`;
}

export async function getUserInfo(accessToken) {
  if (!KEYCLOAK_URL) return null;
  const url = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      sub: data.sub,
      email: data.email,
      name: data.name || data.preferred_username,
      avatar: data.picture,
      preferredUsername: data.preferred_username,
    };
  } catch { return null; }
}
