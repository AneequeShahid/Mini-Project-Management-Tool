import mongoose from "mongoose";

const { Schema, model } = mongoose;

const aiAgentSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true },
    description: { type: String },
    systemPrompt: { type: String },
    model: { type: String, default: "gpt-4o-mini" },
    temperature: { type: Number, default: 0.7 },
    status: { type: String, enum: ["idle", "running", "error", "paused"], default: "idle" },
    actions: [{
      type: { type: String, enum: ["create-task", "update-task", "send-message", "run-report", "custom"] },
      config: { type: Schema.Types.Mixed },
    }],
    schedule: {
      enabled: { type: Boolean, default: false },
      cron: { type: String },
      lastRun: { type: Date },
      nextRun: { type: Date },
    },
    memory: {
      enabled: { type: Boolean, default: true },
      contextWindow: { type: Number, default: 10 },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AIAgent = model("AIAgent", aiAgentSchema);
