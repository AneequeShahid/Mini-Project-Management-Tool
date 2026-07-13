import mongoose from 'mongoose';
import { Task } from '../../src/models/task.js';
import { Project } from '../../src/models/project.js';

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return res.status(500).json({ error: 'MONGODB_URI not configured' });
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
  const db = mongoose.connection.db;

  const projects = await Project.find({});
  const today = new Date().toISOString().split('T')[0];

  for (const project of projects) {
    const statuses = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];
    const snapshot = { projectId: project._id, date: today, counts: {} };

    for (const status of statuses) {
      snapshot.counts[status] = await Task.countDocuments({
        project: project._id,
        status
      });
    }

    await db.collection('cfd_snapshots').updateOne(
      { projectId: project._id, date: today },
      { $set: snapshot },
      { upsert: true }
    );
  }

  res.json({ ok: true, projects: projects.length });
}
