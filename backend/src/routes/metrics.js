import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getGlobalStats, getModelStats, getProjectStats } from "../controllers/metricsController.js";

const router = Router();
router.use(requireAuth);

router.get("/global", getGlobalStats);
router.get("/models", getModelStats);
router.get("/project/:projectId", getProjectStats);

export default router;
