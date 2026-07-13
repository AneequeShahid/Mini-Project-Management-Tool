import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listEpics, getEpic, createEpic, updateEpic, deleteEpic } from "../controllers/epicController.js";

const router = Router();

router.use(requireAuth);
router.get("/project/:projectId", listEpics);
router.get("/:id", getEpic);
router.post("/project/:projectId", createEpic);
router.put("/:id", updateEpic);
router.delete("/:id", deleteEpic);

export default router;
