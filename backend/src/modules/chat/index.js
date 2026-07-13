import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listChannels, createChannel, getChannel, updateChannel, deleteChannel, joinChannel,
  getMessages, sendMessage, editMessage, deleteMessage, addReaction,
} from "../../controllers/chatController.js";

const router = Router();
router.use(requireAuth);

router.get("/channels", listChannels);
router.post("/channels", createChannel);
router.get("/channels/:id", getChannel);
router.put("/channels/:id", updateChannel);
router.delete("/channels/:id", deleteChannel);
router.post("/channels/:id/join", joinChannel);
router.get("/channels/:id/messages", getMessages);
router.post("/channels/:id/messages", sendMessage);
router.put("/messages/:messageId", editMessage);
router.delete("/messages/:messageId", deleteMessage);
router.post("/messages/:messageId/reactions", addReaction);

export default router;
