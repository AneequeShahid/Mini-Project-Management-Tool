import { TimeEntry } from "../models/timeEntry.js";

export async function listTimeEntries(req, res) {
  const filter = {};
  if (req.query.task) filter.task = req.query.task;
  if (req.query.user) filter.user = req.query.user;
  if (req.query.from || req.query.to) {
    filter.startTime = {};
    if (req.query.from) filter.startTime.$gte = new Date(req.query.from);
    if (req.query.to) filter.startTime.$lte = new Date(req.query.to);
  }
  const entries = await TimeEntry.find(filter).populate("user", "name email avatar").populate("task", "title").sort({ startTime: -1 });
  res.json(entries);
}

export async function startTimer(req, res) {
  const active = await TimeEntry.findOne({ user: req.user.id, endTime: null });
  if (active) return res.status(400).json({ message: "Already tracking time on another task" });
  const entry = await TimeEntry.create({ task: req.body.taskId, user: req.user.id, startTime: new Date(), description: req.body.description });
  res.status(201).json(entry);
}

export async function stopTimer(req, res) {
  const entry = await TimeEntry.findOne({ user: req.user.id, endTime: null });
  if (!entry) return res.status(400).json({ message: "No active timer" });
  entry.endTime = new Date();
  entry.duration = (entry.endTime - entry.startTime) / 1000;
  await entry.save();
  res.json(entry);
}

export async function createManualEntry(req, res) {
  const { task, description, startTime, endTime, duration, billable } = req.body;
  const entry = await TimeEntry.create({ task, user: req.user.id, description, startTime, endTime, duration, billable });
  res.status(201).json(entry);
}

export async function deleteTimeEntry(req, res) {
  await TimeEntry.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
}

export async function getTimeReport(req, res) {
  const { from, to, user: userId } = req.query;
  const filter = {};
  if (from || to) {
    filter.startTime = {};
    if (from) filter.startTime.$gte = new Date(from);
    if (to) filter.startTime.$lte = new Date(to);
  }
  if (userId) filter.user = userId;
  else filter.user = req.user.id;
  const entries = await TimeEntry.find(filter).populate("task", "title project").populate("user", "name");
  const totalSeconds = entries.reduce((s, e) => s + (e.duration || 0), 0);
  const byDate = entries.reduce((acc, e) => {
    const day = e.startTime.toISOString().slice(0, 10);
    acc[day] = (acc[day] || 0) + (e.duration || 0);
    return acc;
  }, {});
  res.json({ entries, totalSeconds, totalHours: Math.round(totalSeconds / 3600 * 100) / 100, byDate });
}
