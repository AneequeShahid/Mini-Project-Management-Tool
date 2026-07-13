import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listAllocations, createAllocation, updateAllocation, deleteAllocation, getWorkloadReport,
} from "../../controllers/resourcePlanningController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listAllocations);
router.get("/workload", getWorkloadReport);
router.post("/", createAllocation);
router.put("/:id", updateAllocation);
router.delete("/:id", deleteAllocation);

export default router;
