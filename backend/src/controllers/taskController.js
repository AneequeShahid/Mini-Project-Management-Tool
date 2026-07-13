import { Task } from "../models/task.js";
import { Activity } from "../models/activity.js";
import { requireFields } from "../utils/validators.js";
import logActivity from "../utils/activityLogger.js";
import parseMentions from "../utils/parseMentions.js";


import { emitToProject } from "../services/socket.js";
import { createNotification } from "./notificationController.js";
import { User } from "../models/user.js";
import { paginate, paginatedResponse } from "../middleware/paginate.js";
import { indexTask, deleteTaskIndex } from "../services/meiliSearch.js";
import { TaskHandlers } from "../handlers/taskHandler.js";

export async function listTasks(req, res) {
  const filter = {};
  if (req.query.project) filter.project = req.query.project;
  if (req.query.sprint) filter.sprint = req.query.sprint;
  if (req.query.epic) filter.epic = req.query.epic;
  if (req.query.milestone) filter.milestone = req.query.milestone;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.issueType) filter.issueType = req.query.issueType;
  if (req.query.assignee) filter.assignee = req.query.assignee;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.labels) filter.labels = { $in: req.query.labels.split(",") };
  if (req.query.search) filter.title = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (req.query.dueBefore) filter.dueDate = { ...filter.dueDate, $lte: new Date(req.query.dueBefore) };
  if (req.query.dueAfter) filter.dueDate = { ...filter.dueDate, $gte: new Date(req.query.dueAfter) };
  const { skip, limit, page, perPage } = paginate(req.query.page, req.query.limit);
  const [tasks, total] = await Promise.all([
    Task.find(filter).skip(skip).limit(limit)
      .populate("assignee createdBy", "name email avatar")
      .populate("comments.author", "name email avatar")
      .sort({ createdAt: -1 }),
    Task.countDocuments(filter),
  ]);
  res.json(req.query.page ? paginatedResponse(tasks, total, page, perPage) : tasks);
}

export async function getTask(req, res) {
  const task = await Task.findById(req.params.id)
    .populate("assignee createdBy", "name email avatar")
    .populate("comments.author", "name email avatar");
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
}

export async function createTask(req, res) {
  const body = req.body || {};
  requireFields(body, "title", "project");
  
  const task = await TaskHandlers.handleCreateTask({ 
    ...body, 
    createdBy: req.user.id 
  });
  
  await task.populate("assignee createdBy", "name email avatar");
  res.status(201).json(task);
}

export async function updateTask(req, res) {
  const prev = await Task.findById(req.params.id);
  if (req.body.status === 'In Progress' && prev && !prev.startedAt) {
    req.body.startedAt = new Date();
  }
  if (req.body.status === 'Done' && prev && !prev.resolvedAt) {
    req.body.resolvedAt = new Date();
  }
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    .populate("assignee createdBy", "name email avatar")
    .populate("comments.author", "name email avatar");
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (prev) {
    if (prev.status !== task.status) {
      await Activity.create({ project: task.project, user: req.user.id, action: `moved to ${task.status}`, entityType: "task", entityId: task._id, details: { title: task.title, from: prev.status, to: task.status } });
      createNotification(task.project, { type: "status_changed", title: "Task status changed", message: `"${task.title}" moved to ${task.status}`, link: `/projects/${task.project}/sprint/${task.sprint || ""}`, fromUser: req.user.id, project: task.project });
      
      await logActivity(task._id, req.user.id, 'status_changed', {
        field: 'status',
        oldValue: prev.status,
        newValue: task.status,
        projectId: task.project
      });
    }

    if (prev.priority !== task.priority) {
      await logActivity(task._id, req.user.id, 'priority_changed', {
        field: 'priority',
        oldValue: prev.priority,
        newValue: task.priority,
        projectId: task.project
      });
    }

    if (String(prev.assignee || '') !== String(task.assignee || '')) {
      await logActivity(task._id, req.user.id, 'assignee_changed', {
        field: 'assignee',
        oldValue: prev.assignee,
        newValue: task.assignee,
        projectId: task.project
      });
    }
  }

  if (prev && prev.assignee?.toString() !== task.assignee?.toString() && task.assignee) {
    createNotification(task.assignee._id || task.assignee, { type: "task_assigned", title: "Task assigned", message: `You were assigned: "${task.title}"`, link: `/projects/${task.project}/sprint/${task.sprint || ""}`, fromUser: req.user.id, project: task.project });
  }
  emitToProject(task.project, "task:updated", task);
  indexTask(task);
  res.json(task);
}


export async function deleteTask(req, res) {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  emitToProject(task.project, "task:deleted", { id: req.params.id });
  deleteTaskIndex(req.params.id);
  res.json({ message: "Task deleted" });
}

export async function addComment(req, res) {
  const { text } = req.body || {};
  requireFields(req.body, "text");
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { author: req.user.id, text } } },
    { new: true }
  ).populate("comments.author", "name email avatar");
  if (!task) return res.status(404).json({ message: "Task not found" });
  await Activity.create({ project: task.project, user: req.user.id, action: "commented", entityType: "comment", entityId: task._id, details: { title: task.title } });
  emitToProject(task.project, "comment:added", { taskId: task._id, comment: task.comments[task.comments.length - 1] });
  const mentions = text.match(/@(\w+)/g);
  if (mentions) {
    for (const mention of mentions) {
      const username = mention.slice(1);
      const user = await User.findOne({ name: new RegExp(`^${username}$`, "i") });
      if (user && user._id.toString() !== req.user.id) {
        createNotification(user._id, { type: "mention", title: "Mentioned in comment", message: `${req.user.name || "Someone"} mentioned you in "${task.title}"`, link: `/projects/${task.project}/sprint/${task.sprint || ""}`, fromUser: req.user.id, project: task.project });
      }
    }
  }
  // Call parseMentions for enterprise spec compatibility
  await parseMentions(text, req.user.id, task._id, task.project);
  res.json(task);
}


export async function editComment(req, res) {
  const { commentId, text } = req.body || {};
  requireFields(req.body, "commentId", "text");
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, "comments._id": commentId, "comments.author": req.user.id },
    { $set: { "comments.$.text": text } },
    { new: true }
  ).populate("comments.author", "name email avatar");
  if (!task) return res.status(404).json({ message: "Comment not found or not yours" });
  res.json(task);
}

export async function deleteComment(req, res) {
  const { commentId } = req.params;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, "comments._id": commentId },
    { $pull: { comments: { _id: commentId } } },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Comment not found" });
  res.json(task);
}

export async function addReaction(req, res) {
  const { commentId, emoji } = req.body || {};
  if (!commentId || !emoji) return res.status(400).json({ message: "commentId and emoji required" });
  const task = await Task.findOne({ _id: req.params.id, "comments._id": commentId });
  if (!task) return res.status(404).json({ message: "Task or comment not found" });
  const comment = task.comments.id(commentId);
  const existing = comment.reactions.find((r) => r.emoji === emoji && r.user?.toString() === req.user.id);
  if (existing) {
    comment.reactions.pull(existing._id);
  } else {
    comment.reactions.push({ emoji, user: req.user.id });
  }
  await task.save();
  res.json(task);
}

export async function addAttachment(req, res) {
  const { url, name, size, type } = req.body || {};
  requireFields(req.body, "url", "name");
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { $push: { attachments: { url, name, size, type, uploadedBy: req.user.id } } },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
}

export async function logTime(req, res) {
  try {
    const { hours, description } = req.body;
    const issue = await Task.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    issue.timelogs.push({ userId: req.user.id, hours: Number(hours), description });
    issue.timeSpent = (issue.timeSpent || 0) + Number(hours);
    await issue.save();

    await logActivity(issue._id, req.user.id, 'time_logged', {
      newValue: hours,
      projectId: issue.project
    });

    res.json(issue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

