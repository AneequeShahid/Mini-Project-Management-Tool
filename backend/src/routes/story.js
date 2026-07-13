import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getProjectStory, generateProjectWrapped } from "../controllers/storyController.js";

const router = Router();
router.use(requireAuth);

router.get("/story/:projectId", getProjectStory);
router.get("/wrapped/:projectId", generateProjectWrapped);

export default router;
