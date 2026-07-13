import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "Admin" | "Team Member" | "Viewer";
  avatar?: string;
  accounts: Array<{
    provider: "google" | "github" | "microsoft" | "discord" | "keycloak";
    providerId?: string;
    accessToken?: string;
    refreshToken?: string;
    serverUrl?: string;
    username?: string;
    password?: string;
  }>;
  resetToken?: string;
  resetTokenExpires?: Date;
  bio?: string;
  username?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    digest: "none" | "daily" | "weekly";
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
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

export const User = mongoose.model<IUser>("User", userSchema);
