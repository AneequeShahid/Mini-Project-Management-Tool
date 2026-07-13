import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  listMeetings, getMeeting, createMeeting, updateMeeting, deleteMeeting,
  generateJoinLink, endMeeting, saveNotes, saveAiSummary,
} from "../../controllers/meetingController.js";
import { triggerWorkflow } from "../../services/n8n.js";
import { sendEmail } from "../../services/email.js";

const router = Router();
router.use(requireAuth);

router.get("/", listMeetings);
router.get("/:id", getMeeting);
router.post("/", async (req, res, next) => {
  const originalCreate = createMeeting;
  req.body.provider = req.body.provider || "jitsi";
  await originalCreate(req, res, async (result) => {
    if (res.statusCode === 201) {
      const meeting = res.locals?.meeting || result;
      triggerWorkflow("meeting-created", { meeting, user: req.user });
    }
  });
});
router.put("/:id", updateMeeting);
router.delete("/:id", deleteMeeting);
router.post("/:id/join", async (req, res, next) => {
  if (req.body.notify !== false) {
    const meeting = await (await import("../../models/meeting.js")).default.findById(req.params.id).populate("attendees");
    if (meeting?.attendees?.length) {
      for (const attendee of meeting.attendees) {
        if (attendee.email) {
          sendEmail({
            to: attendee.email,
            subject: `Meeting started: ${meeting.title}`,
            html: `<p>Meeting <strong>${meeting.title}</strong> has started.</p><p>Join at: <a href="${meeting.meetingLink}">${meeting.meetingLink}</a></p>`,
          });
        }
      }
    }
  }
  next();
}, generateJoinLink);
router.post("/:id/end", endMeeting);
router.put("/:id/notes", saveNotes);
router.put("/:id/ai-summary", saveAiSummary);

export default router;
