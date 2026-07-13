import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listIntegrations, createIntegration, updateIntegration, deleteIntegration, syncIntegration, getCalendarEvents } from "../controllers/integrationController.js";

const router = Router();
router.use(requireAuth);
router.get("/calendar/events", getCalendarEvents);
router.get("/workspace/:workspaceId", listIntegrations);
router.post("/workspace/:workspaceId", createIntegration);
router.put("/:id", updateIntegration);
router.delete("/:id", deleteIntegration);
router.post("/:id/sync", syncIntegration);

export default router;
