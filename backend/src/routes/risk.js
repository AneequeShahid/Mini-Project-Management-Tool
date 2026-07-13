import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { riskPredictionService } from "../services/riskPredictionService.js";

const router = Router();
router.use(requireAuth);

router.get("/:projectId/risk", async (req, res) => {
  try {
    const risk = await riskPredictionService.predictProjectRisk(req.params.projectId);
    res.json(risk);
  } catch (e) {
    res.status(500).json({ message: "Failed to predict risk", error: e.message });
  }
});

export default router;
