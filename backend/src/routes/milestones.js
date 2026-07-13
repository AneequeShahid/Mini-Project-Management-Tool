import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listMilestones, getMilestone, createMilestone, updateMilestone, deleteMilestone } from "../controllers/milestoneController.js";

const router = Router();

router.use(requireAuth);
router.get("/project/:projectId", listMilestones);
router.get("/:id", getMilestone);
router.post("/project/:projectId", createMilestone);
router.put("/:id", updateMilestone);
router.delete("/:id", deleteMilestone);

export default router;
