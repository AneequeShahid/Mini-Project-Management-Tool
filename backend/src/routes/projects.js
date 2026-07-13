import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listProjects, getProject, createProject, updateProject, deleteProject, updateProjectRole, cloneProject } from "../controllers/projectController.js";
import { validate } from "../middleware/validate.js";
import { projectSchemas } from "../validations/schemas.js";

const router = Router();

router.use(requireAuth);
router.get("/", listProjects);
router.get("/:id", validate(projectSchemas.update), getProject);
router.post("/", validate(projectSchemas.create), createProject);
router.put("/:id", validate(projectSchemas.update), updateProject);
router.delete("/:id", deleteProject);
router.patch("/:id/role", updateProjectRole);
router.post("/:id/clone", cloneProject);

export default router;
