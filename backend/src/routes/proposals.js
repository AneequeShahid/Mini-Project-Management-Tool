import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listProposals, approveProposal, rejectProposal } from "../controllers/proposalController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listProposals);
router.post("/approve/:id", approveProposal);
router.post("/reject/:id", rejectProposal);

export default router;
