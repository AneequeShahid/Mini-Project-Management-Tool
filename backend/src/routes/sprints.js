import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listSprints, getSprint, createSprint, updateSprint, deleteSprint, getBurndown } from "../controllers/sprintController.js";

const router = Router();

router.use(requireAuth);
router.get("/project/:projectId", listSprints);
router.get("/:id", getSprint);
router.get("/:id/burndown", getBurndown);
router.post("/project/:projectId", requireRole("Admin"), createSprint);
router.put("/:id", requireRole("Admin"), updateSprint);
router.delete("/:id", requireRole("Admin"), deleteSprint);

export default router;
