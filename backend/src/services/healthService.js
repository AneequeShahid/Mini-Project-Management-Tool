import { Task } from "../models/task.js";
import { Project } from "../models/project.js";
import { Sprint } from "../models/sprint.js";
import { User } from "../models/user.js";

export const healthService = {
  async calculateProjectHealth(projectId) {
    const project = await Project.findById(projectId);
    if (!project) throw new Error("Project not found");

    const tasks = await Task.find({ project: projectId });
    const sprints = await Sprint.find({ project: projectId }).sort({ endDate: -1 });

    if (tasks.length === 0) return { score: 0, details: "No data available" };

    // 1. Velocity (Completion Rate)
    const completedTasks = tasks.filter(t => t.status === "Done").length;
    const completionRate = (completedTasks / tasks.length) * 100;

    // 2. Bug Rate (Quality)
    const bugCount = tasks.filter(t => t.issueType === "Bug").length;
    const qualityScore = Math.max(0, 100 - (bugCount / tasks.length * 100));

    // 3. Blocker Impact
    const blockedTasks = tasks.filter(t => t.status === "Blocked").length;
    const blockerPenalty = (blockedTasks / tasks.length) * 50;

    // 4. Workload Balance (Standard Deviation of story points per user)
    const workload = {};
    tasks.forEach(t => {
      if (t.assignee) {
        const uid = t.assignee.toString();
        workload[uid] = (workload[uid] || 0) + (t.storyPoints || 1);
      }
    });
    const values = Object.values(workload);
    const avgWorkload = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const variance = values.length ? values.reduce((a, b) => a + Math.pow(b - avgWorkload, 2), 0) / values.length : 0;
    const balanceScore = Math.max(0, 100 - Math.sqrt(variance));

    // Final Health Score (Weighted Average)
    const overallScore = (
      (completionRate * 0.4) + 
      (qualityScore * 0.3) + 
      (balanceScore * 0.2) - 
      (blockerPenalty * 0.1)
    );

    return {
      score: Math.round(overallScore),
      metrics: {
        completion: Math.round(completionRate),
        quality: Math.round(qualityScore),
        balance: Math.round(balanceScore),
        blockerImpact: Math.round(blockerPenalty),
      },
      momentum: {
        completion: Math.round(completionRate),
        velocity: Math.round(completionRate * 1.1), // Simulated velocity vs target
        quality: Math.round(qualityScore),
      }
    };
  },

  async calculateWorkloadDistribution(projectId) {
    const tasks = await Task.find({ project: projectId });
    const users = await User.find();
    
    const distribution = users.map(user => {
      const userTasks = tasks.filter(t => t.assignee?.toString() === user._id.toString());
      const points = userTasks.reduce((sum, t) => sum + (t.storyPoints || 1), 0);
      return {
        name: user.name,
        points,
        taskCount: userTasks.length,
        status: points > 30 ? "Overloaded" : points < 10 ? "Underutilized" : "Balanced"
      };
    });

    const totalPoints = distribution.reduce((sum, d) => sum + d.points, 0);
    return distribution.map(d => ({
      ...d,
      percentage: totalPoints ? Math.round((d.points / totalPoints) * 100) : 0
    }));
  }
};
