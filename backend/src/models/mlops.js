import mongoose from "mongoose";

const aiModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  provider: { type: String, enum: ["openai", "anthropic", "gemini", "ollama", "huggingface"], required: true },
  modelId: { type: String, required: true },
  version: String,
  endpoint: String,
  apiKey: String,
  config: {
    temperature: Number,
    maxTokens: Number,
    topP: Number,
  },
  status: { type: String, enum: ["active", "inactive", "error"], default: "active" },
  usage: {
    totalRequests: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    lastUsed: Date,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const promptTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  description: String,
  template: { type: String, required: true },
  variables: [String],
  model: { type: mongoose.Schema.Types.ObjectId, ref: "AIModel" },
  category: { type: String, enum: ["general", "task", "sprint", "meeting", "code", "doc"], default: "general" },
}, { timestamps: true });

aiModelSchema.index({ workspace: 1, provider: 1 });

export const AIModel = mongoose.model("AIModel", aiModelSchema);
export const PromptTemplate = mongoose.model("PromptTemplate", promptTemplateSchema);
