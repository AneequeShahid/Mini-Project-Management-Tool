import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listEntries, getEntry, createEntry, updateEntry, deleteEntry, semanticSearchKnowledge,
} from "../../controllers/knowledgeBaseController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listEntries);
router.get("/search", semanticSearchKnowledge);
router.get("/:id", getEntry);
router.post("/", createEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

export default router;
