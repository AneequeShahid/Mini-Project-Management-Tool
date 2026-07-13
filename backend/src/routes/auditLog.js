import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getAuditLogs, exportAuditLogs } from "../controllers/auditLogController.js";

const router = Router();
router.use(requireAuth);

router.get("/", requireRole("Admin"), getAuditLogs);
router.get("/export", requireRole("Admin"), exportAuditLogs);

export default router;
