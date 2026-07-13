import { Project } from "../models/project.js";
import { Sprint } from "../models/sprint.js";
import { Task } from "../models/task.js";
import { requireFields } from "../utils/validators.js";
import { paginate, paginatedResponse } from "../middleware/paginate.js";
import { fastapiService } from "../services/fastapiService.js";
import mongoose from "mongoose";

export async function listProjects(req, res) {
  const filter = req.user.role === "Admin" ? {} : { $or: [{ owner: req.user.id }, { members: req.user.id }] };
  if (req.query.workspace) filter.workspace = req.query.workspace;
  const { skip, limit, page, perPage } = paginate(req.query.page, req.query.limit);
  const [projects, total] = await Promise.all([
    Project.find(filter).skip(skip).limit(limit).populate("owner members roles.user", "name email avatar"),
    Project.countDocuments(filter),
  ]);
  
  // Try to sync with FastAPI, but don't fail if it's down
  try {
     await fastapiService.getProjects();
  } catch (err) {
      console.error("FastAPI unreachable", err);
  }
  
  res.json(req.query.page ? paginatedResponse(projects, total, page, perPage) : projects);
}

export async function getProject(req, res) {
  const project = await Project.findById(req.params.id).populate("owner members roles.user", "name email avatar");
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
}

export async function createProject(req, res) {
  const { name, description, workspace, isTemplate, organization } = req.body || {};
  requireFields(req.body, "name");
  const project = await Project.create({
    name,
    description,
    workspace: workspace || new mongoose.Types.ObjectId(),
    isTemplate,
    organization: organization || new mongoose.Types.ObjectId(),
    owner: req.user.id,
    members: [req.user.id],
    roles: [{ user: req.user.id, role: "Owner" }],
  });
  
  // Async sync to FastAPI
  try {
      await fastapiService.createProject({ name, description });
  } catch (err) {
      console.error("Failed to sync project to FastAPI", err);
  }
  
  await project.populate("owner members roles.user", "name email avatar");
  res.status(201).json(project);
}

export async function updateProject(req, res) {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("owner members roles.user", "name email avatar");
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
}

export async function deleteProject(req, res) {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  await Sprint.deleteMany({ project: project._id });
  await Task.deleteMany({ project: project._id });
  res.json({ message: "Project deleted" });
}

export async function updateProjectRole(req, res) {
  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ message: "userId and role required" });
  const validRoles = ["Owner", "Admin", "Member", "Viewer"];
  if (!validRoles.includes(role)) return res.status(400).json({ message: "Invalid role" });

  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const requesterRole = project.roles.find((r) => r.user?.toString() === req.user.id)?.role || "Viewer";
  const requesterHierarchy = { Owner: 4, Admin: 3, Member: 2, Viewer: 1 };
  if ((requesterHierarchy[requesterRole] || 0) < 3 && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Only Owners and Admins can update roles" });
  }

  const existing = project.roles.find((r) => r.user?.toString() === userId);
  if (existing) {
    existing.role = role;
  } else {
    project.roles.push({ user: userId, role });
    if (!project.members.some((m) => m?.toString() === userId)) {
      project.members.push(userId);
    }
  }

  await project.save();
  await project.populate("owner members roles.user", "name email avatar");
  res.json(project);
}

export async function cloneProject(req, res) {
  const template = await Project.findById(req.params.id);
  if (!template) return res.status(404).json({ message: "Template not found" });

  const newProject = await Project.create({
    name: `${template.name} (Copy)`,
    description: template.description,
    workspace: template.workspace,
    owner: req.user.id,
    members: [req.user.id],
    roles: [{ user: req.user.id, role: "Owner" }],
    isTemplate: false,
    customFieldDefinitions: template.customFieldDefinitions,
    icon: template.icon,
  });

  const sprints = await Sprint.find({ project: template._id });
  for (const s of sprints) {
    const newSprint = await Sprint.create({
      ...s.toObject(),
      _id: undefined,
      project: newProject._id,
      status: "Planned",
    });

    const tasks = await Task.find({ sprint: s._id });
    for (const t of tasks) {
      await Task.create({
        ...t.toObject(),
        _id: undefined,
        project: newProject._id,
        sprint: newSprint._id,
        status: "Backlog",
      });
    }
  }

  res.status(201).json(newProject);
}
