import mongoose from "mongoose";

const automationRuleSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  name: { type: String, required: true },
  trigger: {
    event: { type: String, required: true, enum: ["task:statusChanged", "task:created", "task:assigned", "task:dueSoon", "pr:merged", "sprint:started", "sprint:ended", "meeting:created", "n8n_webhook"] },
    filters: { type: mongoose.Schema.Types.Mixed },
  },
  action: {
    type: { type: String, required: true, enum: ["moveTask", "assignTask", "changePriority", "addLabel", "notify", "createTask", "closeTask", "n8n", "webhook", "email", "slack", "discord"] },
    params: { type: mongoose.Schema.Types.Mixed },
  },
  enabled: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const AutomationRule = mongoose.model("AutomationRule", automationRuleSchema);
