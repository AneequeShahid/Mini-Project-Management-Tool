import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { User } from "../models/user.js";

const router = Router();

router.get("/", requireAuth, requireRole("Admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.patch("/:id/role", requireAuth, requireRole("Admin"), async (req, res) => {
  const allowed = ["Admin", "Team Member", "Viewer"];
  if (!allowed.includes(req.body.role)) return res.status(400).json({ message: "Invalid role" });
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

export default router;
