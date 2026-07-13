import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listUsers, updateRole, updateProfile } from "../controllers/userController.js";

const router = Router();

router.get("/", requireAuth, requireRole("Admin"), listUsers);
router.patch("/:id/role", requireAuth, requireRole("Admin"), updateRole);
router.patch("/profile", requireAuth, updateProfile);

export default router;
