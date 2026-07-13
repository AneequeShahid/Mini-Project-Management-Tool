import { metricsService } from "../services/metricsService.js";

export async function getGlobalStats(req, res) {
  const stats = await metricsService.getStats();
  res.json(stats);
}

export async function getModelStats(req, res) {
  const stats = await metricsService.getCostByModel();
  res.json(stats);
}

export async function getProjectStats(req, res) {
  const { projectId } = req.params;
  const stats = await metricsService.getStats({ projectId });
  const timeSeries = await metricsService.getTimeSeries(projectId);
  res.json({ stats, timeSeries });
}
