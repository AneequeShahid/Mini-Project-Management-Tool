import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  channel: { type: String, default: "general" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ["text", "image", "file", "system"], default: "text" },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" },
  attachments: [{ name: String, url: String, type: String }],
  reactions: [{ emoji: String, users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] }],
  edited: { type: Boolean, default: false },
  editedAt: Date,
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

chatMessageSchema.index({ workspace: 1, channel: 1, createdAt: -1 });
chatMessageSchema.index({ project: 1, createdAt: -1 });

const chatChannelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  type: { type: String, enum: ["public", "private", "direct"], default: "public" },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

chatChannelSchema.index({ workspace: 1, name: 1 }, { unique: true });

export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export const ChatChannel = mongoose.model("ChatChannel", chatChannelSchema);
