import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getPrediction, getBurnoutRisk, captureSnapshot, getSnapshot } from "../controllers/predictiveController.js";

const router = Router();
router.use(requireAuth);

router.get("/predict/:projectId", getPrediction);
router.get("/burnout/:userId/:projectId", getBurnoutRisk);
router.post("/snapshot/:projectId", captureSnapshot);
router.get("/snapshot/:projectId", getSnapshot);

export default router;
