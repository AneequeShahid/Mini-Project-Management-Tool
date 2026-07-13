import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  generateProject, breakdownTask, asyncRequestBreakdown, estimateStoryPoints, planSprint,
  generateStandup, summarizeSprint, predictRisk, generateDocs, aiChat, semanticSearchEndpoint,
  codeReview, meetingSummary, generateReleaseNotes
} from "../controllers/aiController.js";
import { aiChatStream } from "../controllers/aiStreamController.js";


const router = Router();
router.use(requireAuth);

router.post("/generate-project", generateProject);
router.post("/breakdown-task", breakdownTask);
router.post("/async-breakdown", asyncRequestBreakdown);
router.post("/estimate-points", estimateStoryPoints);
router.post("/plan-sprint", planSprint);
router.post("/standup", generateStandup);
router.get("/summarize-sprint/:sprintId", summarizeSprint);
router.get("/predict-risk/:sprintId", predictRisk);
router.get("/docs/:projectId", generateDocs);
router.post("/chat", aiChat);
router.post("/chat-stream", aiChatStream);
router.get("/search", semanticSearchEndpoint);
router.post("/code-review", codeReview);
router.post("/meeting-summary", meetingSummary);
router.get("/release-notes/:projectId", generateReleaseNotes);

export default router;
