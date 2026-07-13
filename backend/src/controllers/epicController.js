import { Epic } from "../models/epic.js";
import { Activity } from "../models/activity.js";
import { requireFields } from "../utils/validators.js";
import { emitToProject } from "../services/socket.js";
import { paginate, paginatedResponse } from "../middleware/paginate.js";

export async function listEpics(req, res) {
  const filter = { project: req.params.projectId };
  if (req.query.status) filter.status = req.query.status;
  const { skip, limit, page, perPage } = paginate(req.query.page, req.query.limit);
  const [epics, total] = await Promise.all([
    Epic.find(filter).skip(skip).limit(limit).populate("createdBy", "name email").sort({ createdAt: -1 }),
    Epic.countDocuments(filter),
  ]);
  res.json(req.query.page ? paginatedResponse(epics, total, page, perPage) : epics);
}

export async function getEpic(req, res) {
  const epic = await Epic.findById(req.params.id).populate("createdBy", "name email");
  if (!epic) return res.status(404).json({ message: "Epic not found" });
  res.json(epic);
}

export async function createEpic(req, res) {
  const body = req.body || {};
  requireFields(body, "name");
  const epic = await Epic.create({ ...body, project: req.params.projectId, createdBy: req.user.id });
  await Activity.create({ project: req.params.projectId, user: req.user.id, action: "created epic", entityType: "epic", entityId: epic._id, details: { name: epic.name } });
  emitToProject(req.params.projectId, "epic:created", epic);
  res.status(201).json(epic);
}

export async function updateEpic(req, res) {
  const epic = await Epic.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!epic) return res.status(404).json({ message: "Epic not found" });
  emitToProject(epic.project, "epic:updated", epic);
  res.json(epic);
}

export async function deleteEpic(req, res) {
  const epic = await Epic.findByIdAndDelete(req.params.id);
  if (!epic) return res.status(404).json({ message: "Epic not found" });
  emitToProject(epic.project, "epic:deleted", { id: req.params.id });
  res.json({ message: "Epic deleted" });
}
