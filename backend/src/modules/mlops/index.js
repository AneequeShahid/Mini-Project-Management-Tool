import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listModels, getModel, createModel, updateModel, deleteModel, getUsageStats,
} from "../../controllers/mlopsController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listModels);
router.get("/stats", getUsageStats);
router.get("/:id", getModel);
router.post("/", createModel);
router.put("/:id", updateModel);
router.delete("/:id", deleteModel);

export default router;
