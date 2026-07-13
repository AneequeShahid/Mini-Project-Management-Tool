import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chatChannelSchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    name: { type: String, required: true },
    type: { type: String, enum: ["team", "project", "direct", "announcement"], default: "team" },
    description: { type: String },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

chatChannelSchema.index({ workspace: 1 });
chatChannelSchema.index({ project: 1, type: 1 });
chatChannelSchema.index({ members: 1 });

export const ChatChannel = model("ChatChannel", chatChannelSchema);
