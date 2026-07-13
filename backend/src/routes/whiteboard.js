import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import Whiteboard from "../models/whiteboard.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const filter = { workspace: req.user.activeWorkspace };
  if (req.query.project) filter.project = req.query.project;
  const boards = await Whiteboard.find(filter).populate("createdBy", "name").sort({ updatedAt: -1 });
  res.json(boards);
});

router.post("/", async (req, res) => {
  const board = await Whiteboard.create({ ...req.body, workspace: req.user.activeWorkspace, createdBy: req.user._id });
  res.status(201).json(board);
});

router.get("/:id", async (req, res) => {
  const board = await Whiteboard.findOne({ _id: req.params.id, workspace: req.user.activeWorkspace });
  if (!board) return res.status(404).json({ message: "Whiteboard not found" });
  res.json(board);
});

router.put("/:id", async (req, res) => {
  const board = await Whiteboard.findOneAndUpdate(
    { _id: req.params.id, workspace: req.user.activeWorkspace },
    { ...req.body, lastEditedBy: req.user._id },
    { new: true }
  );
  if (!board) return res.status(404).json({ message: "Whiteboard not found" });
  res.json(board);
});

router.delete("/:id", async (req, res) => {
  await Whiteboard.findOneAndDelete({ _id: req.params.id, workspace: req.user.activeWorkspace });
  res.json({ message: "Whiteboard deleted" });
});

export default router;
