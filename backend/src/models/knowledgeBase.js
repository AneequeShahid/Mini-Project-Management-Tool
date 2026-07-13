import mongoose from "mongoose";

const knowledgeBaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  content: String,
  contentType: { type: String, enum: ["doc", "transcript", "decision", "architecture", "api", "design", "note"], default: "doc" },
  tags: [String],
  source: { type: String, enum: ["manual", "meeting", "ai", "import"], default: "manual" },
  sourceRef: { type: mongoose.Schema.Types.ObjectId },
  vector: { type: [Number], select: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  version: { type: Number, default: 1 },
  aiSummary: String,
}, { timestamps: true });

knowledgeBaseSchema.index({ workspace: 1, tags: 1 });
knowledgeBaseSchema.index({ workspace: 1, contentType: 1 });
knowledgeBaseSchema.index({ title: "text", content: "text" });

export const KnowledgeBase = mongoose.model("KnowledgeBase", knowledgeBaseSchema);
export default KnowledgeBase;
