import { ResourceAllocation } from "../models/resourceAllocation.js";
import { User } from "../models/user.js";
import { requireFields } from "../utils/validators.js";

export async function listAllocations(req, res) {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.project) filter.project = req.query.project;
  if (req.query.user) filter.user = req.query.user;
  const allocations = await ResourceAllocation.find(filter)
    .populate("user", "name email avatar")
    .populate("project", "name icon")
    .sort({ startDate: -1 });
  res.json(allocations);
}

export async function createAllocation(req, res) {
  const { user, project, allocation, startDate, endDate, role, notes } = req.body || {};
  requireFields(req.body, "user", "allocation");
  const alloc = await ResourceAllocation.create({
    workspace: req.body.workspace || req.query.workspace,
    user, project, allocation, startDate, endDate, role, notes,
  });
  await alloc.populate("user", "name email avatar");
  res.status(201).json(alloc);
}

export async function updateAllocation(req, res) {
  const alloc = await ResourceAllocation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate("user", "name email avatar");
  if (!alloc) return res.status(404).json({ message: "Allocation not found" });
  res.json(alloc);
}

export async function deleteAllocation(req, res) {
  const alloc = await ResourceAllocation.findByIdAndDelete(req.params.id);
  if (!alloc) return res.status(404).json({ message: "Allocation not found" });
  res.json({ message: "Allocation deleted" });
}

export async function getWorkloadReport(req, res) {
  const { workspace } = req.query || {};
  if (!workspace) return res.status(400).json({ message: "Workspace required" });
  const allocations = await ResourceAllocation.find({ workspace })
    .populate("user", "name email avatar")
    .populate("project", "name icon");
  const report = {};
  for (const alloc of allocations) {
    const userId = alloc.user?._id?.toString();
    if (!userId) continue;
    if (!report[userId]) {
      report[userId] = {
        user: alloc.user,
        totalAllocation: 0,
        projects: [],
      };
    }
    report[userId].totalAllocation += alloc.allocation || 0;
    report[userId].projects.push({
      project: alloc.project,
      allocation: alloc.allocation,
      role: alloc.role,
    });
  }
  res.json(Object.values(report));
}
