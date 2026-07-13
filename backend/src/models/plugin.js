import mongoose from "mongoose";

const { Schema, model } = mongoose;

const pluginSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    description: { type: String },
    version: { type: String, default: "1.0.0" },
    author: { type: String },
    homepage: { type: String },
    icon: { type: String },
    type: { type: String, enum: ["official", "community", "custom"], default: "community" },
    category: { type: String, enum: ["integration", "automation", "ui", "analytics", "ai", "other"], default: "other" },
    permissions: [String],
    configSchema: { type: Schema.Types.Mixed },
    isInstalled: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: false },
    installedAt: { type: Date },
    installedBy: { type: Schema.Types.ObjectId, ref: "User" },
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

export const Plugin = model("Plugin", pluginSchema);
