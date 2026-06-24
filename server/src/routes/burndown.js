import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Burndown } from "../models/burndown.js";

const router = Router();

router.get("/sprints/:sprintId", requireAuth, async (req, res) => {
  const data = await Burndown.find({ sprint: req.params.sprintId }).sort({ date: 1 });
  res.json(data);
});

router.post("/sprints/:sprintId", requireAuth, requireRole("Admin", "Team Member"), async (req, res) => {
  const entry = await Burndown.create({ sprint: req.params.sprintId, ...req.body });
  res.status(201).json(entry);
});

export default router;
