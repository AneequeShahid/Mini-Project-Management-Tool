import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listDocuments, getDocument, createDocument, updateDocument, deleteDocument } from "../controllers/documentController.js";

const router = Router();
router.use(requireAuth);
router.get("/workspace/:workspaceId", listDocuments);
router.get("/:id", getDocument);
router.post("/workspace/:workspaceId", createDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

export default router;
