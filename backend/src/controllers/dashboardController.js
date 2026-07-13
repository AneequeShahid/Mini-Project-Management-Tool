import { Project } from "../models/project.js";
import { Sprint } from "../models/sprint.js";
import { Task } from "../models/task.js";
import { User } from "../models/user.js";

export async function getDashboard(req, res) {
  const projectFilter = req.user.role === "Admin"
    ? {}
    : { $or: [{ owner: req.user.id }, { members: req.user.id }] };

  const projects = await Project.find(projectFilter);
  const projectIds = projects.map((p) => p._id);

  const activeSprint = await Sprint.findOne({ project: { $in: projectIds }, status: "Active" })
    .populate("project", "name")
    .sort({ startDate: -1 });

  const tasks = await Task.find({ project: { $in: projectIds } });
  const tasksDue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= new Date() && t.status !== "Done");
  const tasksCompleted = tasks.filter((t) => t.status === "Done");

  const statusCounts = { Backlog: 0, Todo: 0, "In Progress": 0, "In Review": 0, Done: 0 };
  const priorityCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  tasks.forEach((t) => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1; });

  const recentActivity = await Task.find({ project: { $in: projectIds } })
    .sort({ updatedAt: -1 }).limit(10)
    .populate("assignee", "name")
    .select("title status updatedAt assignee");

  res.json({
    totalProjects: projects.length,
    totalTasks: tasks.length,
    tasksDue: tasksDue.length,
    tasksCompleted: tasksCompleted.length,
    activeSprint,
    statusCounts,
    priorityCounts,
    recentActivity,
  });
}
