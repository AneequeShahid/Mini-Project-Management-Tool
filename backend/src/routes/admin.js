import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { getAdminStats, listAllUsers, listAllProjects, archiveProject, restoreProject } from "../controllers/adminController.js";

const router = Router();
router.use(requireAuth, requireRole("Admin"));
router.get("/stats", getAdminStats);
router.get("/users", listAllUsers);
router.get("/projects", listAllProjects);
router.post("/projects/:id/archive", archiveProject);
router.post("/projects/:id/restore", restoreProject);

export default router;
