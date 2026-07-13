import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listAgents, getAgent, createAgent, updateAgent, deleteAgent, executeAgent,
} from "../../controllers/aiAgentsController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listAgents);
router.get("/:id", getAgent);
router.post("/", createAgent);
router.put("/:id", updateAgent);
router.delete("/:id", deleteAgent);
router.post("/:id/execute", executeAgent);

export default router;
