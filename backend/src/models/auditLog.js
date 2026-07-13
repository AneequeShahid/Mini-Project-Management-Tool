import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  entityType: String,
  entityId: String,
  details: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String,
}, { timestamps: true });

auditLogSchema.index({ workspace: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("AuditLog", auditLogSchema);
