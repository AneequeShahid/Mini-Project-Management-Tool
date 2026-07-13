import { Workspace } from "../models/workspace.js";
import { Project } from "../models/project.js";

export async function listWorkspaces(req, res) {
  const workspaces = await Workspace.find({ "members.user": req.user.id }).populate("owner", "name email avatar").populate("members.user", "name email avatar");
  res.json(workspaces);
}

export async function getWorkspace(req, res) {
  const workspace = await Workspace.findById(req.params.id).populate("owner", "name email avatar").populate("members.user", "name email avatar");
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });
  const projects = await Project.find({ workspace: workspace._id }).populate("owner members", "name email avatar");
  res.json({ workspace, projects });
}

export async function createWorkspace(req, res) {
  const { name, slug } = req.body;
  if (!name || !slug) return res.status(400).json({ message: "name and slug required" });
  const existing = await Workspace.findOne({ slug });
  if (existing) return res.status(400).json({ message: "Slug already taken" });
  const workspace = await Workspace.create({ name, slug, owner: req.user.id, members: [{ user: req.user.id, role: "Owner" }] });
  res.status(201).json(workspace);
}

export async function updateWorkspace(req, res) {
  const workspace = await Workspace.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });
  res.json(workspace);
}

export async function deleteWorkspace(req, res) {
  const workspace = await Workspace.findByIdAndDelete(req.params.id);
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });
  await Project.deleteMany({ workspace: workspace._id });
  res.json({ message: "Workspace deleted" });
}

export async function addMember(req, res) {
  const { userId, role } = req.body;
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });
  if (workspace.members.find((m) => m.user.toString() === userId)) return res.status(400).json({ message: "Already a member" });
  workspace.members.push({ user: userId, role: role || "Developer" });
  await workspace.save();
  res.json(workspace);
}

export async function removeMember(req, res) {
  const workspace = await Workspace.findById(req.params.id);
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });
  workspace.members = workspace.members.filter((m) => m.user.toString() !== req.params.userId);
  await workspace.save();
  res.json(workspace);
}
