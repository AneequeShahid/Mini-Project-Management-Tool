import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  label: { type: String }, // e.g., "End of Sprint 12"
  state: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  }, // Stores a compressed snapshot of tasks, sprint statuses, and health metrics
  metrics: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

export const Snapshot = mongoose.model("Snapshot", snapshotSchema);
