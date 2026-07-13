import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAnalytics, exportProjectReport } from "../controllers/analyticsController.js";
import { Sprint } from "../models/sprint.js";
import { Task } from "../models/task.js";
import mongoose from "mongoose";

const router = Router();

router.get("/velocity/:projectId", requireAuth, async (req, res) => {
  try {
    const sprints = await Sprint.find({ project: req.params.projectId })
      .sort({ endDate: -1 })
      .limit(8);

    const velocityData = await Promise.all(sprints.map(async sprint => {
      const completed = await Task.aggregate([
        {
          $match: {
            sprint: sprint._id,
            status: 'Done'
          }
        },
        {
          $group: {
            _id: null,
            totalPoints: { $sum: '$storyPoints' },
            totalIssues: { $sum: 1 }
          }
        }
      ]);

      const planned = await Task.aggregate([
        { $match: { sprint: sprint._id } },
        { $group: { _id: null, totalPoints: { $sum: '$storyPoints' } } }
      ]);

      return {
        sprintName: sprint.name,
        completed: completed[0]?.totalPoints || 0,
        planned: planned[0]?.totalPoints || 0,
        completedIssues: completed[0]?.totalIssues || 0,
        startDate: sprint.startDate,
        endDate: sprint.endDate
      };
    }));

    res.json(velocityData.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cycle-time/:projectId', requireAuth, async (req, res) => {
  try {
    const issues = await Task.find({
      project: req.params.projectId,
      status: 'Done',
      createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
    }).select('createdAt resolvedAt startedAt title issueType priority');

    const data = issues
      .filter(i => i.resolvedAt)
      .map(issue => {
        const leadTime = Math.round(
          (new Date(issue.resolvedAt) - new Date(issue.createdAt))
          / (1000 * 60 * 60 * 24)
        );
        const cycleTime = issue.startedAt
          ? Math.round(
              (new Date(issue.resolvedAt) - new Date(issue.startedAt))
              / (1000 * 60 * 60 * 24)
            )
          : null;
        return {
          title: issue.title,
          type: issue.issueType,
          priority: issue.priority,
          leadTime,
          cycleTime,
          resolvedAt: issue.resolvedAt
        };
      });

    const avgLeadTime = data.length
      ? Math.round(data.reduce((s, i) => s + i.leadTime, 0) / data.length)
      : 0;
    const avgCycleTime = data.filter(i => i.cycleTime).length
      ? Math.round(
          data.filter(i => i.cycleTime)
              .reduce((s, i) => s + i.cycleTime, 0) /
          data.filter(i => i.cycleTime).length
        )
      : 0;

    res.json({ issues: data, avgLeadTime, avgCycleTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cfd/:projectId', requireAuth, async (req, res) => {
  try {
    const snapshots = await mongoose.connection.db.collection('cfd_snapshots')
      .find({ projectId: new mongoose.Types.ObjectId(req.params.projectId) })
      .sort({ date: 1 })
      .limit(30)
      .toArray();
    res.json(snapshots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", requireAuth, (req, res) => { req.params.projectId = undefined; return getAnalytics(req, res); });
router.get("/:projectId", requireAuth, getAnalytics);
router.get("/:projectId/export", requireAuth, exportProjectReport);

export default router;
