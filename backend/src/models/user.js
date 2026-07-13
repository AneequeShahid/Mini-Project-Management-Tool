import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    role: { type: String, enum: ["Admin", "Team Member", "Viewer"], default: "Team Member" },
    avatar: { type: String },
    accounts: [{
      provider: { type: String, enum: ["google", "github", "microsoft", "discord", "keycloak"] },
      providerId: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
      serverUrl: { type: String },
      username: { type: String },
      password: { type: String },
    }],
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
    bio: { type: String },
    username: { type: String },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      digest: { type: String, enum: ["none", "daily", "weekly"], default: "daily" },
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
