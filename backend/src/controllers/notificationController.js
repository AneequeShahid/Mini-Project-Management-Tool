import { Notification } from "../models/notification.js";
import { emitToUser } from "../services/socket.js";
import { sendWebhook } from "../services/webhooks.js";
import { sendEmail } from "../services/emailService.js";
import { Integration } from "../models/integration.js";
import sendNotificationEmail from "../utils/emailNotifier.js";


async function notifyWebhooks(projectId, event, payload) {
  try {
    const { Project } = await import("../models/project.js");
    const proj = await Project.findById(projectId);
    if (!proj?.workspace) return;
    const integrations = await Integration.find({ workspace: proj.workspace, provider: { $in: ["slack", "discord"] }, enabled: true });
    for (const integration of integrations) {
      const url = integration.credentials?.webhookUrl || integration.settings?.webhookUrl;
      if (url) sendWebhook(url, event, { ...payload, project: { _id: projectId, name: proj.name } });
    }
  } catch (err) { /* webhook errors are non-critical */ }
}

export async function listNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 }).limit(50)
    .populate("fromUser", "name avatar");
  const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });
  res.json({ notifications, unreadCount });
}

export async function markRead(req, res) {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ ok: true });
}

export async function markAllRead(req, res) {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  res.json({ ok: true });
}

export async function createNotification(userIdOrProject, { type, title, message, link, fromUser, project }) {
  // If userIdOrProject is an object (project query), notify all project members
  if (typeof userIdOrProject === "object" && userIdOrProject._id) {
    const { Project } = await import("../models/project.js");
    const proj = await Project.findById(project).populate("members", "name email avatar");
    if (proj) {
      for (const member of proj.members) {
        const notif = await Notification.create({ user: member._id, userId: member._id, type, title, message, link, fromUser, actorId: fromUser, project, projectId: project });
        emitToUser(member._id, "notification:new", notif);
        if (member.email) {
          sendEmail({
            to: member.email,
            subject: `PM Tool: ${title}`,
            text: message,
            html: `<p>${message}</p><a href="${link}">View in PM Tool</a>`,
          }).catch(() => {});

          await sendNotificationEmail(
            member.email,
            title,
            `<p>${message}</p>
             <p><a href="${process.env.APP_URL || 'http://localhost:3000'}${link}"
                style="color: #3b82f6;">View details</a></p>`
          );
        }
      }
    }
    if (project) notifyWebhooks(project, type || "notification", { title, message, link });
    return;
  }
  const notif = await Notification.create({ user: userIdOrProject, userId: userIdOrProject, type, title, message, link, fromUser, actorId: fromUser, project, projectId: project });
  emitToUser(userIdOrProject, "notification:new", notif);

  const { User } = await import("../models/user.js");
  const targetUser = await User.findById(userIdOrProject);
  if (targetUser && targetUser.email) {
    await sendNotificationEmail(
      targetUser.email,
      title,
      `<p>${message}</p>
       <p><a href="${process.env.APP_URL || 'http://localhost:3000'}${link}"
          style="color: #3b82f6;">View details</a></p>`
    );
  }

  return notif;
}

