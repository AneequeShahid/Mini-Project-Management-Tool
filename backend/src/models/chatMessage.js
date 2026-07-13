import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chatMessageSchema = new Schema(
  {
    channel: { type: Schema.Types.ObjectId, ref: "ChatChannel", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    contentType: { type: String, enum: ["text", "code", "image", "file"], default: "text" },
    attachments: [{ url: String, name: String, size: Number, type: String }],
    parentMessage: { type: Schema.Types.ObjectId, ref: "ChatMessage" },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: [{ emoji: String, user: { type: Schema.Types.ObjectId, ref: "User" } }],
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

chatMessageSchema.index({ channel: 1, createdAt: -1 });
chatMessageSchema.index({ author: 1 });

export const ChatMessage = model("ChatMessage", chatMessageSchema);
