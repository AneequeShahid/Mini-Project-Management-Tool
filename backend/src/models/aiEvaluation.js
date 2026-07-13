import mongoose from "mongoose";

const aiEvaluationSchema = new mongoose.Schema({
  agentId: { type: String, required: true, index: true }, // The persona (e.g., "architect")
  toolName: { type: String, index: true }, // If a tool was used
  input: { type: String, required: true },
  output: { type: String, required: true },
  rating: { 
    type: String, 
    enum: ["correct", "incorrect", "hallucination", "partial"], 
    required: true 
  },
  feedback: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  timestamp: { type: Date, default: Date.now },
});

export const AIEvaluation = mongoose.model("AIEvaluation", aiEvaluationSchema);
