import { healthService } from "../services/healthService.js";
import { ai } from "../services/ai.js";
import { Task } from "../models/task.js";
import { Sprint } from "../models/sprint.js";
import { User } from "../models/user.js";

export async function getDailyDigest(req, res) {
  const { projectId } = req.params;
  
  const health = await healthService.calculateProjectHealth(projectId);
  const workload = await healthService.calculateWorkloadDistribution(projectId);
  
  // Find critical blockers and overdue tasks
  const blockers = await Task.find({ 
    project: projectId, 
    status: "Blocked" 
  }).populate("assignee", "name");

  const overdue = await Task.find({ 
    project: projectId, 
    status: { $ne: "Done" },
    dueDate: { $lt: new Date() }
  }).populate("assignee", "name");

  const digestContext = {
    healthScore: health.score,
    blockers: blockers.map(b => ({ title: b.title, assignee: b.assignee?.name })),
    overdue: overdue.map(o => ({ title: o.title, assignee: o.assignee?.name })),
    workloadAlerts: workload.filter(w => w.status !== "Balanced"),
    teamMomentum: health.momentum
  };

  const summary = await ai.chat([
    { role: "user", content: `Generate a 'Daily AI Project Manager' digest for this project. Focus on critical blockers, overdue tasks, and team health. Be direct and actionable. Context: ${JSON.stringify(digestContext)}` }
  ], { persona: "manager" });

  res.json({
    summary: summary.reply,
    data: digestContext
  });
}

export async function getAutomationWrappedData(req, res) {
  const { projectId } = req.params;
  const health = await healthService.calculateProjectHealth(projectId);
  const tasks = await Task.find({ project: projectId });
  
  const wrapped = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === "Done").length,
    bugsFixed: tasks.filter(t => t.issueType === "Bug" && t.status === "Done").length,
    velocity: health.momentum.velocity,
    topContributors: (await healthService.calculateWorkloadDistribution(projectId))
      .sort((a, b) => b.points - a.points)
      .slice(0, 3)
  };

  res.json({ wrapped });
}

export async function getRiskAssessment(req, res) {
  const { projectId } = req.params;
  const health = await healthService.calculateProjectHealth(projectId);
  
  const riskAnalysis = await ai.chat([
    { role: "user", content: `Perform a project risk assessment. Current Health: ${health.score}/100. Metrics: ${JSON.stringify(health.metrics)}. Analyze potential bottlenecks and suggest mitigations.` }
  ], { persona: "qa" });

  res.json({
    score: health.score,
    analysis: riskAnalysis.reply,
    metrics: health.metrics
  });
}

export async function listRules(req, res) {
  res.json({ rules: [] });
}

export async function createRule(req, res) {
  res.status(201).json({ message: "Rule created", rule: req.body });
}

export async function updateRule(req, res) {
  res.json({ message: "Rule updated", rule: req.body });
}

export async function deleteRule(req, res) {
  res.json({ message: "Rule deleted" });
}
