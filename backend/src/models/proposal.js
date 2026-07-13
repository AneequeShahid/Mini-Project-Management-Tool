import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema({
  toolName: { type: String, required: true },
  arguments: { type: mongoose.Schema.Types.Mixed, required: true },
  context: { type: mongoose.Schema.Types.Mixed }, // Store context like userId, projectId
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending",
    index: true 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  executedAt: { type: Date },
  result: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export const Proposal = mongoose.model("Proposal", proposalSchema);
