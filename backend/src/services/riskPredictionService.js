import { Task } from "../models/task.js";

export const riskPredictionService = {
  async predictProjectRisk(projectId) {
    const tasks = await Task.find({ project: projectId });
    
    // Simple risk heuristic: 
    // - High % of unassigned tasks
    // - High % of overdue tasks
    // - High % of critical priority tasks without activity
    
    const total = tasks.length;
    if (total === 0) return { score: 0, level: "Low", factors: [] };

    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done").length;
    const unassigned = tasks.filter(t => !t.assignee && t.status !== "Done").length;
    const critical = tasks.filter(t => t.priority === "Critical" && t.status !== "Done").length;

    let score = 0;
    const factors = [];

    if (overdue / total > 0.2) { score += 40; factors.push("High percentage of overdue tasks"); }
    if (unassigned / total > 0.3) { score += 30; factors.push("Significant number of unassigned tasks"); }
    if (critical > 0) { score += 30; factors.push("Critical tasks pending"); }

    return {
      score: Math.min(score, 100),
      level: score > 70 ? "High" : score > 40 ? "Medium" : "Low",
      factors
    };
  }
};
