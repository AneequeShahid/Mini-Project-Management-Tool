import { Project } from "../models/project.js";
import { Task } from "../models/task.js";
import { User } from "../models/user.js";
import { Sprint } from "../models/sprint.js";
import { searchMeili } from "../services/meiliSearch.js";

export async function globalSearch(req, res) {
  const { q, type, status, priority, assignee, sprint, dueDate, project, engine } = req.query || {};
  if (!q && !type && !status && !priority && !assignee && !sprint && !dueDate) {
    return res.status(400).json({ message: "Provide at least one search term or filter" });
  }

  // Try Meilisearch first if query string is provided and engine allows
  if (q && engine !== "mongodb") {
    const meiliResults = await searchMeili(q);
    if (meiliResults) {
      const results = {};
      for (const [key, val] of Object.entries(meiliResults)) {
        const shortKey = key.replace("pm_", "");
        results[shortKey] = val?.hits?.slice(0, 20) || [];
      }
      return res.json({ ...results, _engine: "meilisearch" });
    }
  }

  const regex = q ? new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null;
  const projectFilter = req.user.role === "Admin"
    ? {}
    : { $or: [{ owner: req.user.id }, { members: req.user.id }] };

  const results = { projects: [], tasks: [], users: [], sprints: [] };

  if (!type || type === "projects") {
    const filter = { ...projectFilter };
    if (regex) filter.name = regex;
    results.projects = await Project.find(filter).select("name description status").limit(10);
  }

  if (!type || type === "tasks") {
    const taskFilter = {};
    if (project) taskFilter.project = project;
    if (regex) taskFilter.title = regex;
    if (status) taskFilter.status = status;
    if (priority) taskFilter.priority = priority;
    if (assignee) taskFilter.assignee = assignee;
    if (sprint) taskFilter.sprint = sprint;
    if (dueDate) {
      const d = new Date(dueDate);
      taskFilter.dueDate = { $lte: d, $gte: new Date(d.getTime() - 86400000) };
    }
    results.tasks = await Task.find(taskFilter).populate("assignee", "name").limit(20);
  }

  if (!type || type === "users") {
    if (regex) {
      results.users = await User.find({ $or: [{ name: regex }, { email: regex }] }).select("name email avatar").limit(10);
    }
  }

  if (!type || type === "sprints") {
    const projects = await Project.find(projectFilter).select("_id");
    const projectIds = projects.map((p) => p._id);
    const sprintFilter = { project: { $in: projectIds } };
    if (regex) sprintFilter.name = regex;
    results.sprints = await Sprint.find(sprintFilter).populate("project", "name").limit(10);
  }

  res.json({ ...results, _engine: "mongodb" });
}
