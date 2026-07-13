import { Roadmap } from "../models/roadmap.js";
import { requireFields } from "../utils/validators.js";

export async function listRoadmaps(req, res) {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.project) filter.project = req.query.project;
  const roadmaps = await Roadmap.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 });
  res.json(roadmaps);
}

export async function getRoadmap(req, res) {
  const roadmap = await Roadmap.findById(req.params.id).populate("createdBy", "name email");
  if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });
  res.json(roadmap);
}

export async function createRoadmap(req, res) {
  const { name, description, timeframe, startDate, endDate, milestones, items } = req.body || {};
  requireFields(req.body, "name");
  const roadmap = await Roadmap.create({
    workspace: req.body.workspace || req.query.workspace,
    project: req.body.project,
    name, description, timeframe, startDate, endDate,
    milestones, items, createdBy: req.user.id,
  });
  res.status(201).json(roadmap);
}

export async function updateRoadmap(req, res) {
  const roadmap = await Roadmap.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });
  res.json(roadmap);
}

export async function deleteRoadmap(req, res) {
  const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
  if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });
  res.json({ message: "Roadmap deleted" });
}
