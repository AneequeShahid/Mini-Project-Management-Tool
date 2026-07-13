import { Router } from "express";
import { signToken } from "../utils/jwt.js";
import { User } from "../models/user.js";
import { getAuthUrl, exchangeCode, getUserInfo } from "../services/keycloak.js";

const router = Router();

router.get("/auth-url", (req, res) => {
  const redirectUri = req.query.redirect_uri || process.env.KEYCLOAK_REDIRECT_URI || "http://localhost:3000/auth/keycloak/callback";
  const url = getAuthUrl(redirectUri);
  if (!url) return res.status(400).json({ message: "Keycloak not configured. Set KEYCLOAK_URL." });
  res.json({ url });
});

router.post("/callback", async (req, res) => {
  const { code, redirect_uri } = req.body;
  if (!code) return res.status(400).json({ message: "Authorization code required" });
  const tokens = await exchangeCode(code, redirect_uri || process.env.KEYCLOAK_REDIRECT_URI);
  if (!tokens) return res.status(400).json({ message: "Failed to exchange code" });
  const profile = await getUserInfo(tokens.access_token);
  if (!profile) return res.status(400).json({ message: "Failed to get user info" });
  let user = await User.findOne({ "accounts.providerId": profile.sub, "accounts.provider": "keycloak" });
  if (!user) {
    user = await User.findOne({ email: profile.email });
    if (user) {
      user.accounts.push({ provider: "keycloak", providerId: profile.sub, accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
      await user.save();
    } else {
      user = await User.create({
        name: profile.name || profile.preferredUsername,
        email: profile.email,
        avatar: profile.avatar,
        accounts: [{ provider: "keycloak", providerId: profile.sub, accessToken: tokens.access_token, refreshToken: tokens.refresh_token }],
      });
    }
  }
  const jwtToken = signToken({ id: user._id, role: user.role });
  res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
});

export default router;
