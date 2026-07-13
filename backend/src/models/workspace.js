import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  description: { type: String },
  slug: { type: String, required: true }, // e.g., "engineering-team-a"
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Workspace = mongoose.model("Workspace", workspaceSchema);
