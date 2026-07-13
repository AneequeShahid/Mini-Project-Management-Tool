import { Sprint } from "../models/sprint.js";
import { Task } from "../models/task.js";
import { Activity } from "../models/activity.js";
import { requireFields } from "../utils/validators.js";
import { emitToProject } from "../services/socket.js";
import { createNotification } from "./notificationController.js";
import { paginate, paginatedResponse } from "../middleware/paginate.js";
import { eventBus } from "../services/eventBus.js";
import { v4 as uuidv4 } from "uuid";

export async function listSprints(req, res) {
  const filter = { project: req.params.projectId };
  const { skip, limit, page, perPage } = paginate(req.query.page, req.query.limit);
  const [sprints, total] = await Promise.all([
    Sprint.find(filter).skip(skip).limit(limit).sort({ startDate: -1 }),
    Sprint.countDocuments(filter),
  ]);
  res.json(req.query.page ? paginatedResponse(sprints, total, page, perPage) : sprints);
}

export async function getSprint(req, res) {
  const sprint = await Sprint.findById(req.params.id);
  if (!sprint) return res.status(404).json({ message: "Sprint not found" });
  const tasks = await Task.find({ sprint: sprint._id }).populate("assignee", "name email avatar");
  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const completedPoints = tasks.filter((t) => t.status === "Done").reduce((s, t) => s + (t.storyPoints || 0), 0);
  res.json({ sprint, tasks, totalPoints, completedPoints });
}

export async function createSprint(req, res) {
  const body = req.body || {};
  requireFields(body, "name", "startDate", "endDate");
  const sprint = await Sprint.create({ ...body, project: req.params.projectId });
  await Activity.create({ project: req.params.projectId, user: req.user.id, action: "created sprint", entityType: "sprint", entityId: sprint._id, details: { name: sprint.name } });
  emitToProject(req.params.projectId, "sprint:created", sprint);
  res.status(201).json(sprint);
}

async function computeVelocity(sprintId) {
  const tasks = await Task.find({ sprint: sprintId });
  const velocity = tasks.filter((t) => t.status === "Done").reduce((s, t) => s + (t.storyPoints || 0), 0);
  await Sprint.findByIdAndUpdate(sprintId, { velocity });
  return velocity;
}

export async function updateSprint(req, res) {
  const prev = await Sprint.findById(req.params.id);
  const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!sprint) return res.status(404).json({ message: "Sprint not found" });
  if (prev && prev.status !== sprint.status && sprint.status === "Active") {
    createNotification(sprint.project, { type: "sprint_started", title: "Sprint started", message: `"${sprint.name}" is now active`, link: `/projects/${sprint.project}/sprint/${sprint._id}`, project: sprint.project });
  }
  if (prev && prev.status !== sprint.status && sprint.status === "Completed") {
    await computeVelocity(sprint._id);
    createNotification(sprint.project, { type: "sprint_completed", title: "Sprint completed", message: `"${sprint.name}" completed`, link: `/projects/${sprint.project}/sprint/${sprint._id}`, project: sprint.project });
    
    // Publish Domain Event
    eventBus.publish({
      id: uuidv4(),
      type: "SPRINT_COMPLETED",
      aggregateId: sprint._id,
      timestamp: new Date(),
      version: 1,
      payload: {
        sprintId: sprint._id,
        projectId: sprint.project,
        name: sprint.name,
      },
    });
  }
  emitToProject(sprint.project, "sprint:updated", sprint);
  res.json(sprint);
}

export async function deleteSprint(req, res) {
  const sprint = await Sprint.findByIdAndDelete(req.params.id);
  if (!sprint) return res.status(404).json({ message: "Sprint not found" });
  await Task.updateMany({ sprint: sprint._id }, { $unset: { sprint: "" } });
  emitToProject(sprint.project, "sprint:deleted", { id: req.params.id });
  res.json({ message: "Sprint deleted" });
}

export async function getBurndown(req, res) {
  const sprint = await Sprint.findById(req.params.id);
  if (!sprint) return res.status(404).json({ message: "Sprint not found" });
  const tasks = await Task.find({ sprint: sprint._id });
  const totalDays = Math.ceil((new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24)) || 1;
  const data = [];
  for (let i = 0; i <= totalDays; i++) {
    const day = new Date(sprint.startDate);
    day.setDate(day.getDate() + i);
    const remaining = tasks.filter((t) => {
      const doneAt = t.updatedAt || t.createdAt;
      return t.status !== "Done" || doneAt > day;
    }).reduce((s, t) => s + (t.storyPoints || 0), 0);
    data.push({ day: day.toISOString().slice(0, 10), remaining });
  }
  res.json(data);
}

export async function getActivity(req, res) {
  const activities = await Activity.find({ project: req.params.projectId })
    .sort({ createdAt: -1 }).limit(50)
    .populate("user", "name avatar");
  res.json(activities);
}
