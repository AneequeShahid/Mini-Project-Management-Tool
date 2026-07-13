import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Notification } from "../models/notification.js";
import { listNotifications, markRead, markAllRead } from "../controllers/notificationController.js";

const router = Router();
router.use(requireAuth);

// Get unread count
router.get('/unread-count', async (req, res) => {
  const count = await Notification.countDocuments({
    $or: [{ user: req.user.id }, { userId: req.user.id }],
    read: false
  });
  res.json({ count });
});

// Get all notifications (compatible with populated actorId and issueId)
router.get('/', async (req, res) => {
  const notifications = await Notification.find({
    $or: [{ user: req.user.id }, { userId: req.user.id }]
  })
  .populate('actorId fromUser', 'name avatar')
  .populate('issueId', 'title key')
  .sort({ createdAt: -1 })
  .limit(30);

  // Map actorId to fromUser and vice versa for compatibility
  const mapped = notifications.map(n => {
    const obj = n.toObject();
    obj.actorId = obj.actorId || obj.fromUser;
    obj.fromUser = obj.fromUser || obj.actorId;
    return obj;
  });

  res.json(mapped);
});

// Mark all as read (PATCH)
router.patch('/mark-all-read', async (req, res) => {
  await Notification.updateMany(
    { $or: [{ user: req.user.id }, { userId: req.user.id }], read: false },
    { $set: { read: true } }
  );
  res.json({ message: 'All marked as read' });
});

// Mark one as read (PATCH)
router.patch('/:id/read', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: 'Marked as read' });
});

// Keep legacy POST endpoints for backward compatibility
router.post("/:id/read", markRead);
router.post("/read-all", markAllRead);

export default router;
