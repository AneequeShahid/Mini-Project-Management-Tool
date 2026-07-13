import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { listTasks, getTask, createTask, updateTask, deleteTask, addComment, editComment, deleteComment, addAttachment, addReaction, logTime } from "../controllers/taskController.js";

const router = Router();

router.use(requireAuth);
router.get("/", listTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/comments", addComment);
router.put("/:id/comments", editComment);
router.delete("/:id/comments/:commentId", deleteComment);
router.post("/:id/attachments", addAttachment);
router.post("/:id/reactions", addReaction);
router.post("/:id/log-time", logTime);

export default router;

