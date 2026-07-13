import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listPipelines, getPipeline, createPipeline, updatePipeline, deletePipeline, handleWebhook,
} from "../../controllers/cicdController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listPipelines);
router.get("/:id", getPipeline);
router.post("/", createPipeline);
router.put("/:id", updatePipeline);
router.delete("/:id", deletePipeline);
router.post("/webhook", handleWebhook);

export default router;
