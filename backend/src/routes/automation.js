import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDailyDigest, getAutomationWrappedData, getRiskAssessment } from "../controllers/automationController.js";

const router = Router();
router.use(requireAuth);

router.get("/daily-digest/:projectId", getDailyDigest);
router.get("/wrapped-data/:projectId", getAutomationWrappedData);
router.get("/risk-assessment/:projectId", getRiskAssessment);

export default router;
