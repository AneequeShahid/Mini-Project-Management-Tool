import { ChatChannel } from "../models/chatChannel.js";
import { ChatMessage } from "../models/chatMessage.js";
import { requireFields } from "../utils/validators.js";
import { getIO } from "../services/socket.js";

export async function listChannels(req, res) {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.project) filter.project = req.query.project;
  if (req.query.type) filter.type = req.query.type;
  filter.$or = [{ members: req.user.id }, { type: "announcement" }];
  const channels = await ChatChannel.find(filter)
    .populate("members createdBy", "name email avatar")
    .sort({ lastActivity: -1 });
  res.json(channels);
}

export async function createChannel(req, res) {
  const { name, type, description, project, members } = req.body || {};
  requireFields(req.body, "name");
  const channel = await ChatChannel.create({
    workspace: req.body.workspace || req.query.workspace,
    project, name, type: type || "team",
    description, members: [...new Set([...(members || []), req.user.id])],
    createdBy: req.user.id,
  });
  await channel.populate("members createdBy", "name email avatar");
  res.status(201).json(channel);
}

export async function getChannel(req, res) {
  const channel = await ChatChannel.findById(req.params.id)
    .populate("members createdBy", "name email avatar");
  if (!channel) return res.status(404).json({ message: "Channel not found" });
  res.json(channel);
}

export async function updateChannel(req, res) {
  const channel = await ChatChannel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate("members createdBy", "name email avatar");
  if (!channel) return res.status(404).json({ message: "Channel not found" });
  res.json(channel);
}

export async function deleteChannel(req, res) {
  const channel = await ChatChannel.findByIdAndDelete(req.params.id);
  if (!channel) return res.status(404).json({ message: "Channel not found" });
  await ChatMessage.deleteMany({ channel: channel._id });
  res.json({ message: "Channel deleted" });
}

export async function joinChannel(req, res) {
  const channel = await ChatChannel.findById(req.params.id);
  if (!channel) return res.status(404).json({ message: "Channel not found" });
  if (!channel.members.some((m) => m.toString() === req.user.id)) {
    channel.members.push(req.user.id);
    await channel.save();
  }
  await channel.populate("members createdBy", "name email avatar");
  res.json(channel);
}

export async function getMessages(req, res) {
  const { limit = 50, before } = req.query;
  const filter = { channel: req.params.id };
  if (before) filter._id = { $lt: before };
  const messages = await ChatMessage.find(filter)
    .populate("author", "name email avatar")
    .populate("mentions", "name email")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
  res.json(messages.reverse());
}

export async function sendMessage(req, res) {
  const { content, contentType, parentMessage, mentions } = req.body || {};
  requireFields(req.body, "content");
  const message = await ChatMessage.create({
    channel: req.params.id,
    author: req.user.id,
    content, contentType: contentType || "text",
    parentMessage, mentions: mentions || [],
  });
  await message.populate("author", "name email avatar");
  await message.populate("mentions", "name email");

  await ChatChannel.findByIdAndUpdate(req.params.id, { lastActivity: new Date() });

  try {
    const io = getIO();
    io.to(`channel:${req.params.id}`).emit("chat:message", message);
  } catch {
    // Socket not available, message still persisted
  }

  res.status(201).json(message);
}

export async function editMessage(req, res) {
  const { content } = req.body || {};
  if (!content) return res.status(400).json({ message: "Content required" });
  const message = await ChatMessage.findOneAndUpdate(
    { _id: req.params.messageId, author: req.user.id },
    { content, edited: true, editedAt: new Date() },
    { new: true }
  ).populate("author", "name email avatar");
  if (!message) return res.status(404).json({ message: "Message not found or not authorized" });

  try {
    const io = getIO();
    io.to(`channel:${message.channel}`).emit("chat:edited", message);
  } catch {}

  res.json(message);
}

export async function deleteMessage(req, res) {
  const message = await ChatMessage.findOneAndDelete({
    _id: req.params.messageId,
    author: req.user.id,
  });
  if (!message) return res.status(404).json({ message: "Message not found or not authorized" });

  try {
    const io = getIO();
    io.to(`channel:${message.channel}`).emit("chat:deleted", { messageId: req.params.messageId });
  } catch {}

  res.json({ message: "Message deleted" });
}

export async function addReaction(req, res) {
  const { emoji } = req.body || {};
  if (!emoji) return res.status(400).json({ message: "Emoji required" });
  const message = await ChatMessage.findById(req.params.messageId);
  if (!message) return res.status(404).json({ message: "Message not found" });

  const existing = message.reactions.find((r) => r.emoji === emoji && r.user.toString() === req.user.id);
  if (existing) {
    message.reactions = message.reactions.filter((r) => !(r.emoji === emoji && r.user.toString() === req.user.id));
  } else {
    message.reactions.push({ emoji, user: req.user.id });
  }
  await message.save();

  try {
    const io = getIO();
    io.to(`channel:${message.channel}`).emit("chat:reaction", { messageId: req.params.messageId, reactions: message.reactions });
  } catch {}

  res.json({ reactions: message.reactions });
}
