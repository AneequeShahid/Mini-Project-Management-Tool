import { Metric } from "../models/metric.js";

export const metricsService = {
  async logMetric({ endpoint, model, promptTokens, completionTokens, latencyMs, cost, userId, projectId }) {
    const totalTokens = promptTokens + completionTokens;
    return await Metric.create({
      endpoint,
      model,
      promptTokens,
      completionTokens,
      totalTokens,
      latencyMs,
      cost,
      userId,
      projectId,
    });
  },

  async getStats(filter = {}) {
    const stats = await Metric.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$cost" },
          totalTokens: { $sum: "$totalTokens" },
          avgLatency: { $avg: "$latencyMs" },
          count: { $sum: 1 },
        },
      },
    ]);
    return stats[0] || { totalCost: 0, totalTokens: 0, avgLatency: 0, count: 0 };
  },

  async getCostByModel(filter = {}) {
    return await Metric.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$model",
          totalCost: { $sum: "$cost" },
          totalTokens: { $sum: "$totalTokens" },
        },
      },
    ]);
  },

  async getTimeSeries(projectId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Metric.aggregate([
      { $match: { projectId, timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          cost: { $sum: "$cost" },
          tokens: { $sum: "$totalTokens" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);
  }
};
