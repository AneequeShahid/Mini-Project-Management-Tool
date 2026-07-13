import mongoose from "mongoose";

const { Schema, model } = mongoose;

const mlopsModelSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace" },
    name: { type: String, required: true },
    provider: { type: String, enum: ["openai", "ollama", "anthropic", "gemini", "huggingface", "custom"], required: true },
    modelId: { type: String, required: true },
    version: { type: String },
    status: { type: String, enum: ["active", "inactive", "error"], default: "active" },
    type: { type: String, enum: ["chat", "embedding", "code", "image"], default: "chat" },
    config: {
      temperature: { type: Number },
      maxTokens: { type: Number },
      topP: { type: Number },
    },
    usageStats: {
      totalRequests: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      avgLatency: { type: Number },
      lastUsed: { type: Date },
    },
    promptTemplates: [{
      name: { type: String },
      template: { type: String },
      variables: [String],
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const MLOpsModel = model("MLOpsModel", mlopsModelSchema);
