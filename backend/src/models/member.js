import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", index: true },
  role: { 
    type: String, 
    enum: ["Owner", "Admin", "Member", "Viewer"], 
    default: "Member", 
    required: true 
  },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true });

memberSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

export const Member = mongoose.model("Member", memberSchema);
