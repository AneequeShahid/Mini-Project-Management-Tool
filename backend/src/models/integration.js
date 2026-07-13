import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  provider: { type: String, required: true }, // e.g., "n8n", "slack", "discord", "custom"
  eventType: { type: String, required: true }, // e.g., "TASK_CREATED", "SPRINT_COMPLETED", "DAILY_DIGEST"
  webhookUrl: { type: String, required: true },
  secret: { type: String }, // For signing requests
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const Integration = mongoose.model("Integration", integrationSchema);
