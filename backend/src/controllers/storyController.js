import { healthService } from "../services/healthService.js";
import { ai } from "../services/ai.js";
import { Task } from "../models/task.js";
import { Sprint } from "../models/sprint.js";

export async function getProjectStory(req, res) {
  const { projectId, sprintId } = req.params;
  
  const health = await healthService.calculateProjectHealth(projectId);
  const workload = await healthService.calculateWorkloadDistribution(projectId);
  
  const tasks = await Task.find({ 
    project: projectId, 
    ...(sprintId && { sprint: sprintId }) 
  }).populate("assignee", "name");

  const completedTasks = tasks.filter(t => t.status === "Done");

  const storyContext = {
    healthScore: health.score,
    metrics: health.metrics,
    momentum: health.momentum,
    workload: workload,
    completedCount: completedTasks.length,
    topContributors: workload.sort((a, b) => b.points - a.points).slice(0, 3),
    recentMilestones: completedTasks.slice(-5).map(t => t.title)
  };

  const narrative = await ai.chat([
    { role: "user", content: `Turn these metrics into a compelling project story. Focus on the narrative of progress and the human effort. Metrics: ${JSON.stringify(storyContext)}` }
  ], { persona: "storyteller" });

  res.json({
    narrative: narrative.reply,
    health: health,
    workload: workload
  });
}

export async function generateProjectWrapped(req, res) {
  const { projectId } = req.params;
  const health = await healthService.calculateProjectHealth(projectId);
  const tasks = await Task.find({ project: projectId });
  
  const wrappedData = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === "Done").length,
    bugsFixed: tasks.filter(t => t.issueType === "Bug" && t.status === "Done").length,
    totalPoints: tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0),
    topContributor: (await healthService.calculateWorkloadDistribution(projectId))[0]
  };

  const slides = await ai.chat([
    { role: "user", content: `Create a 'Spotify Wrapped' style slide deck (array of 5-7 slides) for this project. Each slide should have a 'title', 'stat', and 'punchline'. Data: ${JSON.stringify(wrappedData)}` }
  ], { persona: "storyteller" });

  res.json({
    slides: slides.reply,
    summary: wrappedData
  });
}
