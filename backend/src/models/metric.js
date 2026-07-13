import mongoose from "mongoose";

const metricSchema = new mongoose.Schema({
  endpoint: { type: String, required: true, index: true },
  model: { type: String, required: true, index: true },
  promptTokens: { type: Number, required: true },
  completionTokens: { type: Number, required: true },
  totalTokens: { type: Number, required: true },
  latencyMs: { type: Number, required: true },
  cost: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const Metric = mongoose.model("Metric", metricSchema);
