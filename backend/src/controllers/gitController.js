import { GitRepo } from "../models/gitRepo.js";
import { Task } from "../models/task.js";
import { requireFields } from "../utils/validators.js";
import { gitService } from "../services/gitService.js";

export async function listRepos(req, res) {
  const filter = req.query.workspace ? { workspace: req.query.workspace } : {};
  if (req.query.project) filter.project = req.query.project;
  const repos = await GitRepo.find(filter).populate("project", "name icon");
  res.json(repos);
}

export async function createRepo(req, res) {
  const { provider, owner, repo, fullName, project, defaultBranch } = req.body || {};
  requireFields(req.body, "provider", "owner", "repo", "fullName");
  const existing = await GitRepo.findOne({ workspace: req.body.workspace, fullName });
  if (existing) return res.status(409).json({ message: "Repository already registered" });
  const gitRepo = await GitRepo.create({
    workspace: req.body.workspace || req.query.workspace,
    provider, owner, repo, fullName,
    url: `https://${provider}.com/${fullName}`,
    project, defaultBranch,
  });
  res.status(201).json(gitRepo);
}

export async function updateRepo(req, res) {
  const gitRepo = await GitRepo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!gitRepo) return res.status(404).json({ message: "Repository not found" });
  res.json(gitRepo);
}

export async function deleteRepo(req, res) {
  const gitRepo = await GitRepo.findByIdAndDelete(req.params.id);
  if (!gitRepo) return res.status(404).json({ message: "Repository not found" });
  res.json({ message: "Repository deleted" });
}

export async function listCommits(req, res) {
  const repo = await GitRepo.findById(req.params.id);
  if (!repo) return res.status(404).json({ message: "Repository not found" });
  try {
    const commits = await gitService.getCommits(repo, repo.accessToken || process.env.GITHUB_TOKEN);
    res.json(commits);
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not fetch commits" });
  }
}

export async function listPRs(req, res) {
  const repo = await GitRepo.findById(req.params.id);
  if (!repo) return res.status(404).json({ message: "Repository not found" });
  try {
    const prs = await gitService.getPRs(repo, repo.accessToken || process.env.GITHUB_TOKEN);
    res.json(prs);
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not fetch PRs" });
  }
}

export async function syncRepo(req, res) {
  const repo = await GitRepo.findById(req.params.id);
  if (!repo) return res.status(404).json({ message: "Repository not found" });
  try {
    const { commits, prs } = await gitService.syncRepo(repo, repo.accessToken || process.env.GITHUB_TOKEN);
    await GitRepo.findByIdAndUpdate(repo._id, { lastSyncedAt: new Date() });
    res.json({ message: "Sync successful", commitsCount: commits.length, prsCount: prs.length });
  } catch (err) {
    res.status(500).json({ message: err.message || "Sync failed" });
  }
}

export async function linkTask(req, res) {
  const { id, type, externalId } = req.params;
  const { taskId } = req.body || {};
  if (!taskId) return res.status(400).json({ message: "taskId required" });
  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });
  task.linkedPRs = task.linkedPRs || [];
  task.linkedPRs.push({ repo: id, type, externalId, url: req.body.url || "" });
  await task.save();
  res.json({ message: "Task linked", task });
}
