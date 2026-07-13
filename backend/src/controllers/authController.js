import bcrypt from "bcryptjs";
import { User } from "../models/user.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import { requireFields, asEmail } from "../utils/validators.js";

export async function register(req, res) {
  const { name, email, password } = req.body || {};
  requireFields(req.body, "name", "email", "password");
  if (!asEmail(email)) return res.status(400).json({ message: "Invalid email format" });
  if ((await User.findOne({ email }))) return res.status(409).json({ message: "Email already in use" });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: passwordHash });
  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  requireFields(req.body, "email", "password");
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = signToken({ id: user._id, role: user.role });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function getProfile(req, res) {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

export async function oauthCallback(req, res) {
  const { provider, code } = req.body;
  if (!provider || !code) return res.status(400).json({ message: "Provider and code required" });

  let profile;
  if (provider === "github") {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).json({ message: "Failed to get access token" });
    const userRes = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    profile = await userRes.json();
    const emailRes = await fetch("https://api.github.com/user/emails", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    const emails = await emailRes.json();
    const primary = emails.find((e) => e.primary) || emails[0];
    let user = await User.findOne({ "accounts.providerId": String(profile.id) });
    if (!user) {
      user = await User.findOne({ email: primary.email });
      if (user) {
        user.accounts.push({ provider, providerId: String(profile.id), accessToken: tokenData.access_token });
        await user.save();
      } else {
        user = await User.create({ name: profile.login, email: primary.email, avatar: profile.avatar_url, accounts: [{ provider, providerId: String(profile.id), accessToken: tokenData.access_token }] });
      }
    }
    const token = signToken({ id: user._id, role: user.role });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  }

  if (provider === "google") {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback", grant_type: "authorization_code" }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).json({ message: "Failed to get access token" });
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    profile = await userRes.json();
    let user = await User.findOne({ "accounts.providerId": profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.email });
      if (user) {
        user.accounts.push({ provider, providerId: profile.id, accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token });
        await user.save();
      } else {
        user = await User.create({ name: profile.name, email: profile.email, avatar: profile.picture, accounts: [{ provider, providerId: profile.id, accessToken: tokenData.access_token, refreshToken: tokenData.refresh_token }] });
      }
    }
    const token = signToken({ id: user._id, role: user.role });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  }

  return res.status(400).json({ message: "Unsupported provider" });
}

export async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: "Email required" });
  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "If that email exists, a reset link has been sent" });
  const resetToken = signToken({ id: user._id, purpose: "reset" }, "15m");
  user.resetToken = resetToken;
  user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  res.json({ message: "If that email exists, a reset link has been sent", resetToken });
}

export async function resetPassword(req, res) {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ message: "Token and password required" });
  try {
    const decoded = verifyToken(token);
    if (decoded.purpose !== "reset") return res.status(400).json({ message: "Invalid token" });
    const user = await User.findById(decoded.id);
    if (!user || user.resetToken !== token || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (_) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
}
