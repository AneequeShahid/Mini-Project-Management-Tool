import mongoose from "mongoose";

const { Schema, model } = mongoose;

const roleValues = ["Admin", "Team Member", "Viewer"];

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: roleValues, default: "Team Member" },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
