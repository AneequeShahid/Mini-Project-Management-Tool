import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // e.g., "acme-corp"
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  settings: {
    aiModelPreference: { type: String, default: "gpt-4o-mini" },
    notificationPreferences: { type: mongoose.Schema.Types.Mixed },
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Organization = mongoose.model("Organization", organizationSchema);
