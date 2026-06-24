import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Task } from "../models/task.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const { project, sprint } = req.query;
  const filter = {};
  if (project) filter.project = project;
  if (sprint) filter.sprint = sprint;
  const tasks = await Task.find(filter).populate("assignee", "name email").populate("createdBy", "name");
  res.json(tasks);
});

router.post("/", requireAuth, async (req, res) => {
  const task = await Task.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json(task);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

router.delete("/:id", requireAuth, requireRole("Admin", "Team Member"), async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
