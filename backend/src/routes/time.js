import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listTimeEntries, startTimer, stopTimer, createManualEntry, deleteTimeEntry, getTimeReport } from "../controllers/timeController.js";

const router = Router();
router.use(requireAuth);
router.get("/", listTimeEntries);
router.post("/start", startTimer);
router.post("/stop", stopTimer);
router.post("/manual", createManualEntry);
router.delete("/:id", deleteTimeEntry);
router.get("/report", getTimeReport);

export default router;
