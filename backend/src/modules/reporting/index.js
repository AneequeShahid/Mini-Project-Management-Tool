import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listReports, getReport, createReport, deleteReport, downloadReport,
} from "../../controllers/reportingController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listReports);
router.get("/:id", getReport);
router.post("/", createReport);
router.delete("/:id", deleteReport);
router.get("/:id/download", downloadReport);

export default router;
