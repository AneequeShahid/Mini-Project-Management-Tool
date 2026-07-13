import { Team } from "../models/team.js";
import { requireFields } from "../utils/validators.js";

export async function listTeams(req, res) {
  const filter = req.query.workspace ? { workspace: req.query.workspace } : {};
  if (req.user.role !== "Admin") {
    filter.$or = [{ members: req.user.id }, { lead: req.user.id }];
  }
  const teams = await Team.find(filter).populate("lead members", "name email avatar").populate("projects", "name icon");
  res.json(teams);
}

export async function getTeam(req, res) {
  const team = await Team.findById(req.params.id).populate("lead members", "name email avatar").populate("projects", "name icon status");
  if (!team) return res.status(404).json({ message: "Team not found" });
  res.json(team);
}

export async function createTeam(req, res) {
  const { name, description, lead, members, projects } = req.body || {};
  requireFields(req.body, "name");
  const team = await Team.create({
    workspace: req.body.workspace || req.query.workspace,
    name, description, lead, members, projects,
  });
  await team.populate("lead members", "name email avatar");
  res.status(201).json(team);
}

export async function updateTeam(req, res) {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate("lead members", "name email avatar");
  if (!team) return res.status(404).json({ message: "Team not found" });
  res.json(team);
}

export async function deleteTeam(req, res) {
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });
  res.json({ message: "Team deleted" });
}

export async function addMember(req, res) {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ message: "userId required" });
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });
  if (!team.members.some((m) => m.toString() === userId)) {
    team.members.push(userId);
    await team.save();
  }
  await team.populate("lead members", "name email avatar");
  res.json(team);
}

export async function removeMember(req, res) {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });
  team.members = team.members.filter((m) => m.toString() !== req.params.userId);
  await team.save();
  await team.populate("lead members", "name email avatar");
  res.json(team);
}
