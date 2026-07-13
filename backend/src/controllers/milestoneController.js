import { Milestone } from "../models/milestone.js";
import { Activity } from "../models/activity.js";
import { requireFields } from "../utils/validators.js";
import { emitToProject } from "../services/socket.js";
import { paginate, paginatedResponse } from "../middleware/paginate.js";

export async function listMilestones(req, res) {
  const filter = { project: req.params.projectId };
  if (req.query.status) filter.status = req.query.status;
  const { skip, limit, page, perPage } = paginate(req.query.page, req.query.limit);
  const [milestones, total] = await Promise.all([
    Milestone.find(filter).skip(skip).limit(limit).populate("createdBy", "name email").sort({ dueDate: 1 }),
    Milestone.countDocuments(filter),
  ]);
  res.json(req.query.page ? paginatedResponse(milestones, total, page, perPage) : milestones);
}

export async function getMilestone(req, res) {
  const milestone = await Milestone.findById(req.params.id).populate("createdBy", "name email");
  if (!milestone) return res.status(404).json({ message: "Milestone not found" });
  res.json(milestone);
}

export async function createMilestone(req, res) {
  const body = req.body || {};
  requireFields(body, "name", "dueDate");
  const milestone = await Milestone.create({ ...body, project: req.params.projectId, createdBy: req.user.id });
  await Activity.create({ project: req.params.projectId, user: req.user.id, action: "created milestone", entityType: "milestone", entityId: milestone._id, details: { name: milestone.name } });
  emitToProject(req.params.projectId, "milestone:created", milestone);
  res.status(201).json(milestone);
}

export async function updateMilestone(req, res) {
  const milestone = await Milestone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!milestone) return res.status(404).json({ message: "Milestone not found" });
  emitToProject(milestone.project, "milestone:updated", milestone);
  res.json(milestone);
}

export async function deleteMilestone(req, res) {
  const milestone = await Milestone.findByIdAndDelete(req.params.id);
  if (!milestone) return res.status(404).json({ message: "Milestone not found" });
  emitToProject(milestone.project, "milestone:deleted", { id: req.params.id });
  res.json({ message: "Milestone deleted" });
}
