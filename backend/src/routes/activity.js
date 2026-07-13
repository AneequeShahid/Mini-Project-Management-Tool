import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getActivity } from "../controllers/sprintController.js";
import { Activity } from "../models/activity.js";

const router = Router();

// New route: Get all activities for a task/issue
router.get('/issue/:issueId', requireAuth, async (req, res) => {
  try {
    const activities = await Activity.find({
      $or: [
        { issueId: req.params.issueId },
        { entityId: req.params.issueId }
      ]
    })
    .populate('user userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(50);
    
    // Map userId/user for safety in frontend
    const mapped = activities.map(act => {
      const obj = act.toObject();
      obj.userId = obj.userId || obj.user;
      return obj;
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New route: Get all activities for a project
router.get('/project/:projectId', requireAuth, async (req, res) => {
  try {
    const activities = await Activity.find({
      $or: [
        { projectId: req.params.projectId },
        { project: req.params.projectId }
      ]
    })
    .populate('user userId', 'name email avatar')
    .populate('issueId entityId', 'title key')
    .sort({ createdAt: -1 })
    .limit(100);

    const mapped = activities.map(act => {
      const obj = act.toObject();
      obj.userId = obj.userId || obj.user;
      obj.issueId = obj.issueId || obj.entityId;
      return obj;
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy route compatibility
router.get("/:projectId", requireAuth, getActivity);

export default router;
