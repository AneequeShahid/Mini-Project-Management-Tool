import mongoose from "mongoose";

const { Schema, model } = mongoose;

const knowledgeEntrySchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    contentHtml: { type: String },
    category: { type: String, enum: ["wiki", "decision-log", "architecture", "api-doc", "design-doc", "meeting-transcript", "general"], default: "general" },
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastEditedBy: { type: Schema.Types.ObjectId, ref: "User" },
    embedding: { type: [Number] },
    source: { type: String },
    sourceId: { type: String },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

knowledgeEntrySchema.index({ workspace: 1, category: 1 });
knowledgeEntrySchema.index({ project: 1 });
knowledgeEntrySchema.index({ tags: 1 });

export const KnowledgeEntry = model("KnowledgeEntry", knowledgeEntrySchema);
