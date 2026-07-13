import { Snapshot } from "../models/snapshot.js";
import { Task } from "../models/task.js";
import { Sprint } from "../models/sprint.js";
import { healthService } from "./healthService.js";

export const snapshotService = {
  async captureSnapshot(projectId, label = "Auto-Snapshot") {
    const tasks = await Task.find({ project: projectId }).lean();
    const sprints = await Sprint.find({ project: projectId }).lean();
    const health = await healthService.calculateProjectHealth(projectId);

    const snapshot = await Snapshot.create({
      projectId,
      label,
      state: {
        tasks: tasks.map(t => ({
          _id: t._id,
          status: t.status,
          assignee: t.assignee,
          priority: t.priority
        })),
        sprints: sprints.map(s => ({
          _id: s._id,
          status: s.status,
          goal: s.goal
        }))
      },
      metrics: health
    });

    return snapshot;
  },

  async getSnapshotAtDate(projectId, date) {
    const snapshot = await Snapshot.findOne({
      projectId,
      timestamp: { $lte: new Date(date) }
    }).sort({ timestamp: -1 });

    return snapshot;
  },

  async listSnapshots(projectId) {
    return await Snapshot.find({ projectId }).sort({ timestamp: -1 });
  }
};
