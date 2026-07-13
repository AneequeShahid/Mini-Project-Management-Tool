import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { sendEmail } from "../services/email.js";

const router = Router();
router.use(requireAuth);

router.post("/send", requireRole("Admin"), async (req, res) => {
  const { to, subject, html, text } = req.body;
  if (!to || !subject) return res.status(400).json({ message: "to and subject required" });
  const result = await sendEmail({ to, subject, html, text });
  res.json(result);
});

router.post("/test", requireRole("Admin"), async (req, res) => {
  const result = await sendEmail({
    to: req.user.email,
    subject: "PM Tool - Email Service Test",
    html: "<h1>Email service is working</h1><p>This is a test email from your Project Management Tool.</p>",
  });
  res.json({ message: "Test email sent", result });
});

export default router;
