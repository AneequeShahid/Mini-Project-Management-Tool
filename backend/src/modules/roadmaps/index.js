import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listRoadmaps, getRoadmap, createRoadmap, updateRoadmap, deleteRoadmap,
} from "../../controllers/roadmapController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listRoadmaps);
router.get("/:id", getRoadmap);
router.post("/", createRoadmap);
router.put("/:id", updateRoadmap);
router.delete("/:id", deleteRoadmap);

export default router;
