import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Sprint } from "../models/sprint.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const sprints = await Sprint.find().populate("project").sort({ createdAt: -1 });
  res.json(sprints);
});

router.post("/", requireAuth, requireRole("Admin", "Team Member"), async (req, res) => {
  const sprint = await Sprint.create(req.body);
  res.status(201).json(sprint);
});

router.patch("/:id", requireAuth, requireRole("Admin", "Team Member"), async (req, res) => {
  const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!sprint) return res.status(404).json({ message: "Sprint not found" });
  res.json(sprint);
});

router.delete("/:id", requireAuth, requireRole("Admin"), async (req, res) => {
  await Sprint.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
