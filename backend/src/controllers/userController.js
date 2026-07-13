import { User } from "../models/user.js";
import { paginate, paginatedResponse } from "../middleware/paginate.js";

export async function listUsers(req, res) {
  const { skip, limit, page, perPage } = paginate(req.query.page, req.query.limit);
  const [users, total] = await Promise.all([
    User.find().select("-password").skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  res.json(req.query.page ? paginatedResponse(users, total, page, perPage) : users);
}

export async function updateRole(req, res) {
  const allowed = ["Admin", "Team Member", "Viewer"];
  if (!allowed.includes(req.body.role)) return res.status(400).json({ message: "Invalid role" });
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

export async function updateProfile(req, res) {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, avatar }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}
