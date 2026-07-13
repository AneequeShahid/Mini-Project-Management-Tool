import { User } from "../models/user.js";
import { Project } from "../models/project.js";
import { Task } from "../models/task.js";
import { Sprint } from "../models/sprint.js";

export async function getAdminStats(req, res) {
  const [users, projects, tasks, sprints] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Task.countDocuments(),
    Sprint.countDocuments(),
  ]);
  const archivedProjects = await Project.countDocuments({ status: "Archived" });
  res.json({ users, projects, tasks, sprints, archivedProjects });
}

export async function listAllUsers(req, res) {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
}

export async function listAllProjects(req, res) {
  const { status } = req.query || {};
  const filter = status ? { status } : {};
  const projects = await Project.find(filter).populate("owner", "name email").sort({ createdAt: -1 });
  res.json(projects);
}

export async function archiveProject(req, res) {
  const project = await Project.findByIdAndUpdate(req.params.id, { status: "Archived" }, { new: true });
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
}

export async function restoreProject(req, res) {
  const project = await Project.findByIdAndUpdate(req.params.id, { status: "Active" }, { new: true });
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
}
