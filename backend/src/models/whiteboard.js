import mongoose from "mongoose";

const whiteboardSchema = new mongoose.Schema({
  name: { type: String, default: "Untitled Whiteboard" },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

whiteboardSchema.index({ workspace: 1 });

export default mongoose.model("Whiteboard", whiteboardSchema);
