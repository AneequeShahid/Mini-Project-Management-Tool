import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Integration } from "../models/integration.js";
import { fetchCalendars, fetchEvents, createEvent, deleteEvent } from "../services/caldav.js";

const router = Router();
router.use(requireAuth);

router.get("/calendars", async (req, res) => {
  const integration = await Integration.findOne({ workspace: req.user.activeWorkspace, provider: "caldav", enabled: true });
  if (!integration) return res.status(404).json({ message: "No CalDAV integration found. Create one via /api/integrations." });
  const calendars = await fetchCalendars(integration.credentials);
  res.json(calendars);
});

router.get("/events", async (req, res) => {
  const integration = await Integration.findOne({ workspace: req.user.activeWorkspace, provider: "caldav", enabled: true });
  if (!integration) return res.status(404).json({ message: "No CalDAV integration found." });
  const { calendarUrl, startDate, endDate } = req.query;
  if (!calendarUrl || !startDate || !endDate) return res.status(400).json({ message: "calendarUrl, startDate, endDate required" });
  const events = await fetchEvents(integration.credentials, calendarUrl, new Date(startDate), new Date(endDate));
  res.json(events);
});

router.post("/events", async (req, res) => {
  const integration = await Integration.findOne({ workspace: req.user.activeWorkspace, provider: "caldav", enabled: true });
  if (!integration) return res.status(404).json({ message: "No CalDAV integration found." });
  const { calendarUrl, ...event } = req.body;
  if (!calendarUrl) return res.status(400).json({ message: "calendarUrl required" });
  const result = await createEvent(integration.credentials, calendarUrl, event);
  res.status(201).json(result);
});

router.delete("/events", async (req, res) => {
  const integration = await Integration.findOne({ workspace: req.user.activeWorkspace, provider: "caldav", enabled: true });
  if (!integration) return res.status(404).json({ message: "No CalDAV integration found." });
  const { calendarUrl, eventUrl } = req.body;
  if (!calendarUrl || !eventUrl) return res.status(400).json({ message: "calendarUrl and eventUrl required" });
  await deleteEvent(integration.credentials, calendarUrl, eventUrl);
  res.json({ message: "Event deleted" });
});

export default router;
