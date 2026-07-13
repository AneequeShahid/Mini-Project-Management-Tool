import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  contentType: { type: String, enum: ["richtext", "markdown"], default: "richtext" },
  icon: { type: String, default: "📄" },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Document = mongoose.model("Document", documentSchema);
