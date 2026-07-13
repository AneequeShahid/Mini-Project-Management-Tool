import { predictionService } from "../services/predictionService.js";
import { snapshotService } from "../services/snapshotService.js";

export async function getPrediction(req, res) {
  const { projectId } = req.params;
  try {
    const prediction = await predictionService.predictCompletion(projectId);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getBurnoutRisk(req, res) {
  const { userId, projectId } = req.params;
  try {
    const risk = await predictionService.predictBurnoutRisk(userId, projectId);
    res.json(risk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function captureSnapshot(req, res) {
  const { projectId } = req.params;
  const { label } = req.body;
  try {
    const snapshot = await snapshotService.captureSnapshot(projectId, label);
    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getSnapshot(req, res) {
  const { projectId } = req.params;
  const { date } = req.query;
  try {
    const snapshot = await snapshotService.getSnapshotAtDate(projectId, date);
    res.json(snapshot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
