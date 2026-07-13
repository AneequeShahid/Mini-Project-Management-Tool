import AuditLog from "../models/auditLog.js";

export async function audit(req, action, entityType, entityId, details) {
  try {
    await AuditLog.create({
      workspace: req.user?.activeWorkspace,
      user: req.user?._id,
      action,
      entityType,
      entityId,
      details,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  } catch (_) {}
}

export const getAuditLogs = async (req, res) => {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.user) filter.user = req.query.user;
  if (req.query.action) filter.action = req.query.action;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const logs = await AuditLog.find(filter)
    .populate("user", "name email avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await AuditLog.countDocuments(filter);
  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
};
