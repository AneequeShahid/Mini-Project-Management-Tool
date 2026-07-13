import { AIEvaluation } from "../models/aiEvaluation.js";

export const evaluationService = {
  async logEvaluation({ agentId, toolName, input, output, rating, feedback, userId }) {
    return await AIEvaluation.create({
      agentId,
      toolName,
      input,
      output,
      rating,
      feedback,
      userId
    });
  },

  async getAgentPerformance(agentId) {
    const stats = await AIEvaluation.aggregate([
      { $match: { agentId } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = stats.reduce((sum, s) => sum + s.count, 0);
    const successRate = total ? (stats.find(s => s._id === "correct")?.count || 0) / total * 100 : 0;
    
    return {
      agentId,
      totalEvaluations: total,
      successRate: Math.round(successRate),
      distribution: stats
    };
  }
};
