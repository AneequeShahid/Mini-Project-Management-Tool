import AuditLog from "../models/auditLog.js";
import { Parser } from "json2csv";

export const getAuditLogs = async (req, res) => {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.user) filter.user = req.query.user;
  if (req.query.action) filter.action = req.query.action;
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  
  const logs = await AuditLog.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
    
  const total = await AuditLog.countDocuments(filter);
  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
};

export const exportAuditLogs = async (req, res) => {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  
  const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).lean();
  
  const fields = ["createdAt", "user", "action", "entityType", "entityId", "ip"];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(logs);
  
  res.header("Content-Type", "text/csv");
  res.attachment("audit_logs.csv");
  res.send(csv);
};
