import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Project } from "../models/project.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const project = await Project.create({ ...req.body, owner: req.user.id });
  res.status(201).json(project);
});

router.get("/", requireAuth, async (req, res) => {
  const projects = await Project.find().populate("owner", "name email").populate("members", "name email");
  res.json(projects);
});

router.patch("/:id", requireAuth, requireRole("Admin", "Team Member"), async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
});

router.delete("/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
