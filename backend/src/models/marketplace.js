import mongoose from "mongoose";

const pluginSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  version: String,
  author: String,
  icon: String,
  type: { type: String, enum: ["integration", "automation", "view", "widget", "tool"], default: "integration" },
  permissions: [String],
  configSchema: mongoose.Schema.Types.Mixed,
  source: { type: String, enum: ["official", "community", "custom"], default: "community" },
  downloads: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  enabled: { type: Boolean, default: false },
  installedAt: Date,
  installedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
}, { timestamps: true });

pluginSchema.index({ workspace: 1, name: 1 });

export default mongoose.model("Plugin", pluginSchema);
