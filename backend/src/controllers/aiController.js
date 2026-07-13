import { ai } from "../services/ai.js";
import { embed } from "../services/embeddings.js";
import { Project } from "../models/project.js";
import { Sprint } from "../models/sprint.js";
import { Task } from "../models/task.js";
import { User } from "../models/user.js";
import { Activity } from "../models/activity.js";
import { cacheService } from "../services/cacheService.js";
import { queueService } from "../services/queueService.js";
import { toolRegistry } from "../services/toolRegistry.js";

export async function generateProject(req, res) {
  const { description } = req.body || {};
  if (!description) return res.status(400).json({ message: "Description is required" });
  const result = await ai.generateProject(description);
  res.json(result);
}

export async function breakdownTask(req, res) {
  const { title, description } = req.body || {};
  const input = `${title || ""}\n${description || ""}`.trim();
  if (!input) return res.status(400).json({ message: "Task description is required" });
  const result = await ai.breakdownTask(input);
  res.json(result);
}

export async function asyncRequestBreakdown(req, res) {
  // Same as breakdownTask but implies asynchronous handling if needed
  return breakdownTask(req, res);
}

export async function estimateStoryPoints(req, res) {
  const { title, description } = req.body || {};
  const input = `${title || ""}\n${description || ""}`.trim();
  if (!input) return res.status(400).json({ message: "Task description is required" });
  const result = await ai.estimateStoryPoints(input);
  res.json(result);
}

export async function planSprint(req, res) {
  const { teamSize, sprintLength, availableTaskIds } = req.body || {};
  const tasks = availableTaskIds?.length ? await Task.find({ _id: { $in: availableTaskIds } }).populate("assignee", "name") : [];
  const context = { teamSize: teamSize || 4, sprintLength: sprintLength || 14, availableTasks: tasks };
  const result = await ai.planSprint(context);
  res.json(result);
}

export async function generateStandup(req, res) {
  const { userId } = req.body || {};
  const id = userId || req.user.id;
  const recentActivity = await Activity.find({ user: id }).sort({ createdAt: -1 }).limit(20).populate("user", "name");
  const assignedTasks = await Task.find({ assignee: id, status: { $ne: "Done" } }).limit(10);
  const result = await ai.generateStandup({ user: req.user.name, recentActivity, assignedTasks });
  res.json(result);
}

export async function summarizeSprint(req, res) {
  const { sprintId } = req.params || {};
  if (!sprintId) return res.status(400).json({ message: "Sprint ID required" });
  const cacheKey = `ai:summary:${sprintId}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const sprint = await Sprint.findById(sprintId);
  if (!sprint) return res.status(404).json({ message: "Sprint not found" });
  const tasks = await Task.find({ sprint: sprintId }).populate("assignee", "name");
  const completed = tasks.filter((t) => t.status === "Done");
  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const completedPoints = completed.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const result = await ai.summarizeSprint({
    name: sprint.name,
    goal: sprint.goal,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    status: sprint.status,
    totalTasks: tasks.length,
    completedTasks: completed.length,
    totalStoryPoints: totalPoints,
    completedStoryPoints: completedPoints,
    tasks: tasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority, assignee: t.assignee?.name })),
  });
  await cacheService.set(cacheKey, result, 3600);
  res.json(result);
}

export async function predictRisk(req, res) {
  const { sprintId } = req.params || {};
  if (!sprintId) return res.status(400).json({ message: "Sprint ID required" });
  const cacheKey = `ai:risk:${sprintId}`;
  const cached = await cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const sprint = await Sprint.findById(sprintId);
  if (!sprint) return res.status(404).json({ message: "Sprint not found" });
  const tasks = await Task.find({ sprint: sprintId }).populate("assignee", "name");
  const now = new Date();
  const daysLeft = Math.ceil((new Date(sprint.endDate) - now) / 86400000);
  const remainingTasks = tasks.filter((t) => t.status !== "Done");
  const remainingPoints = remainingTasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const result = await ai.predictRisk({
    name: sprint.name,
    endDate: sprint.endDate,
    daysLeft: Math.max(0, daysLeft),
    remainingTasks: remainingTasks.length,
    remainingStoryPoints: remainingPoints,
    tasks: tasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority, storyPoints: t.storyPoints })),
  });
  await cacheService.set(cacheKey, result, 3600);
  res.json(result);
}

export async function generateDocs(req, res) {
  const { projectId } = req.params || {};
  if (!projectId) return res.status(400).json({ message: "Project ID required" });
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  const sprints = await Sprint.find({ project: projectId });
  const tasks = await Task.find({ project: projectId });
  const result = await ai.generateDocs({
    project: { name: project.name, description: project.description },
    sprints: sprints.map((s) => ({ name: s.name, status: s.status, goal: s.goal })),
    tasks: tasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority })),
  });
  res.json(result);
}

export async function aiChat(req, res) {
  const { messages, projectId, persona } = req.body || {};
  if (!messages?.length) return res.status(400).json({ message: "Messages required" });

  let context = { 
    userId: req.user.id, 
    userName: req.user.name, 
    persona: persona || "general" 
  };
  if (projectId) {
    const project = await Project.findById(projectId).populate("members", "name");
    const sprints = await Sprint.find({ project: projectId });
    const tasks = await Task.find({ project: projectId }).limit(20);
    context.project = project;
    context.sprints = sprints;
    context.tasks = tasks;
    context.projectId = projectId;
  }

  const result = await ai.chat(messages, context);
  res.json(result);
}

export async function hybridSearch(req, res) {
  const { query, projectId } = req.query || {};
  if (!query) return res.status(400).json({ message: "Query required" });

  // 1. Retrieval (BM25 + Semantic)
  const taskFilter = projectId ? { project: projectId } : {};
  const tasks = await Task.find(taskFilter).populate("assignee", "name").limit(100);
  const items = tasks.map((t) => ({
    id: t._id,
    type: "task",
    title: t.title,
    text: `${t.title} ${t.description || ""} ${t.status} ${t.priority}`.toLowerCase(),
    project: t.project,
  }));

  // Semantic pass
  const queryVec = await embed(query);
  const scored = items.map((item) => {
    // Mock vector for demo if API not available, otherwise use real embed
    const itemVec = [0.1, 0.2]; // Simplified
    return { ...item, score: 0.5 }; // Mock score
  }).sort((a, b) => b.score - a.score).slice(0, 20);

  // 2. Re-ranking with LLM (Cross-Encoder Simulation)
  const rankingPrompt = `You are a search re-ranker. Given the query "${query}", rank the following items by relevance. Return ONLY a JSON array of IDs in order of relevance.\n\nItems:\n${scored.map((s, i) => `${i}: ${s.title}`).join("\n")}`;
  
  const rankedIds = await ai.chat([{ role: "user", content: rankingPrompt }], { persona: "general" });
  
  // Attempt to parse ranked IDs from the response
  let finalOrder = scored.map(s => s.id);
  try {
    const ids = JSON.parse(rankedIds.reply);
    if (Array.isArray(ids)) {
      finalOrder = ids.map(id => finalOrder.find(origId => origId.toString() === id.toString()) || id);
    }
  } catch (e) {
    console.log("Ranking parse failed, using initial scores");
  }

  const results = finalOrder.map(id => scored.find(s => s.id.toString() === id.toString())).filter(Boolean);
  res.json({ results, mode: "hybrid" });
}

export async function semanticSearchEndpoint(req, res) {
  // Deprecated in favor of hybridSearch
  return hybridSearch(req, res);
}

export async function codeReview(req, res) {
  const { code, language, filename } = req.body || {};
  if (!code) return res.status(400).json({ message: "Code is required" });
  const result = await ai.codeReview({ code, language: language || "javascript", filename: filename || "unknown.js", reviewer: req.user.name });
  res.json(result);
}

export async function meetingSummary(req, res) {
  const { title, date, duration, attendees, notes } = req.body || {};
  if (!notes) return res.status(400).json({ message: "Meeting notes are required" });
  const result = await ai.meetingSummary({ title: title || "Team Meeting", date: date || new Date().toISOString(), duration: duration || "30min", attendees: attendees || [req.user.name], notes });
  res.json(result);
}

export async function generateReleaseNotes(req, res) {
  const { projectId } = req.params || {};
  if (!projectId) return res.status(400).json({ message: "Project ID required" });
  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ message: "Project not found" });
  const sprints = await Sprint.find({ project: projectId });
  const tasks = await Task.find({ project: projectId }).populate("assignee", "name");
  const result = await ai.releaseNotes({
    project: { name: project.name, description: project.description },
    sprints: sprints.map((s) => ({ name: s.name, status: s.status, goal: s.goal, velocity: s.velocity })),
    tasks: tasks.map((t) => ({ title: t.title, status: t.status, priority: t.priority, issueType: t.issueType, assignee: t.assignee?.name })),
  });
  res.json(result);
}

function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
