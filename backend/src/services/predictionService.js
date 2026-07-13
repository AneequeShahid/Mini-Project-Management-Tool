import { Task } from "../models/task.js";
import { Sprint } from "../models/sprint.js";
import { Project } from "../models/project.js";

export const predictionService = {
  /**
   * Predicts the completion date and probability of success for a project.
   * Uses a weighted moving average of historical velocity and blocker impact.
   */
  async predictCompletion(projectId) {
    const sprints = await Sprint.find({ project: projectId }).sort({ endDate: 1 });
    const tasks = await Task.find({ project: projectId, status: { $ne: "Done" } });
    
    if (sprints.length === 0) {
      return { error: "Insufficient historical data to make a prediction" };
    }

    // 1. Calculate Historical Velocity (Story Points per Sprint)
    const velocities = sprints.map(s => {
      const completedPoints = tasks
        .filter(t => t.sprint?.toString() === s._id.toString() && t.status === "Done")
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      return completedPoints;
    });

    // Weighted Moving Average (More weight to recent sprints)
    let totalWeight = 0;
    let weightedSum = 0;
    velocities.forEach((v, i) => {
      const weight = i + 1;
      weightedSum += v * weight;
      totalWeight += weight;
    });
    const avgVelocity = weightedSum / totalWeight;

    // 2. Calculate Remaining Work
    const remainingPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    // 3. Predict Sprints Remaining
    const sprintsRemaining = Math.ceil(remainingPoints / (avgVelocity || 1));

    // 4. Adjust for Blocker Risk (The "Friction" Factor)
    const blockedTasks = tasks.filter(t => t.status === "Blocked").length;
    const frictionFactor = 1 + (blockedTasks / tasks.length) * 0.5; // Up to 50% delay
    const adjustedSprints = sprintsRemaining * frictionFactor;

    // 5. Project Date
    const lastSprintEnd = sprints[sprints.length - 1].endDate || new Date();
    const predictedDate = new Date(lastSprintEnd);
    predictedDate.setDate(predictedDate.getDate() + (adjustedSprints * 14)); // Assuming 14-day sprints

    // 6. Confidence Score
    const confidence = Math.max(0, 100 - (velocities.length < 3 ? 30 : 0) - (blockedTasks * 5));

    return {
      predictedCompletionDate: predictedDate,
      probabilityOfSuccess: confidence,
      estimatedSprintsRemaining: Math.round(adjustedSprints),
      factors: {
        avgVelocity: Math.round(avgVelocity),
        remainingPoints,
        frictionFactor: frictionFactor.toFixed(2),
        confidence: confidence
      }
    };
  },

  async predictBurnoutRisk(userId, projectId) {
    const tasks = await Task.find({ assignee: userId, project: projectId });
    const now = new Date();
    
    // Analyze recent activity (last 14 days)
    const recentTasks = tasks.filter(t => t.updatedAt > new Date(now - 14 * 24 * 60 * 60 * 1000));
    const points = recentTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    
    // Simple threshold-based risk
    let riskLevel = "Low";
    let recommendation = "Workload is balanced.";
    
    if (points > 40) {
      riskLevel = "High";
      recommendation = "User is handling significantly more complexity than average. Consider redistributing tasks.";
    } else if (points > 25) {
      riskLevel = "Medium";
      recommendation = "Workload is increasing. Monitor for burnout.";
    }

    return {
      userId,
      riskLevel,
      points,
      recommendation,
      timestamp: now
    };
  }
};
