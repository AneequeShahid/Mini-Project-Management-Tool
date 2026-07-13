import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listWorkspaces, getWorkspace, createWorkspace, updateWorkspace, deleteWorkspace, addMember, removeMember } from "../controllers/workspaceController.js";

const router = Router();
router.use(requireAuth);
router.get("/", listWorkspaces);
router.get("/:id", getWorkspace);
router.post("/", createWorkspace);
router.put("/:id", updateWorkspace);
router.delete("/:id", deleteWorkspace);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

export default router;
