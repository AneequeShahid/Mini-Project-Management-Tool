import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listTeams, getTeam, createTeam, updateTeam, deleteTeam, addMember, removeMember,
} from "../../controllers/teamController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listTeams);
router.get("/:id", getTeam);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

export default router;
