import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Task } from '../models/task.js';
import { logTime } from '../controllers/taskController.js';
import mongoose from 'mongoose';

const router = Router();

router.post('/:id/log-time', requireAuth, logTime);


router.get('/by-key/:key', requireAuth, async (req, res) => {
  try {
    const { key } = req.params;
    let task = null;
    if (mongoose.Types.ObjectId.isValid(key)) {
      task = await Task.findById(key);
    }
    if (!task) {
      // Fallback: search by title (exact case-insensitive)
      task = await Task.findOne({ title: new RegExp(`^${key}$`, 'i') });
    }
    if (!task) {
      // Second fallback: partial title match
      task = await Task.findOne({ title: new RegExp(key, 'i') });
    }
    if (!task) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
