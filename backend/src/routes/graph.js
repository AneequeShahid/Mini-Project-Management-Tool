import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { visualizeGraph } from "../controllers/graphController.js";

const router = Router();
router.use(requireAuth);

router.get("/visualize/:projectId", visualizeGraph);

export default router;
