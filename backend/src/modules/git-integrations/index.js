import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listRepos, createRepo, updateRepo, deleteRepo,
  listCommits, listPRs, linkTask, syncRepo,
} from "../../controllers/gitController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listRepos);
router.post("/", createRepo);
router.put("/:id", updateRepo);
router.delete("/:id", deleteRepo);
router.get("/:id/commits", listCommits);
router.get("/:id/prs", listPRs);
router.post("/:id/sync", syncRepo);
router.post("/:id/link/:type/:externalId", linkTask);

export default router;
