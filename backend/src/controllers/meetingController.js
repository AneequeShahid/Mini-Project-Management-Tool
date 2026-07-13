import { Meeting } from "../models/meeting.js";
import { requireFields } from "../utils/validators.js";
import { ai } from "../services/ai.js";
import { zoomService } from "../services/zoomService.js";
import { Integration } from "../models/integration.js";

function generateJitsiUrl(title) {
  const roomName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  return `https://meet.jit.si/${roomName}-${Date.now().toString(36)}`;
}

export async function listMeetings(req, res) {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.project) filter.project = req.query.project;
  if (req.query.status) filter.status = req.query.status;
  const meetings = await Meeting.find(filter)
    .populate("host attendees", "name email avatar")
    .sort({ startTime: -1 });
  res.json(meetings);
}

export async function getMeeting(req, res) {
  const meeting = await Meeting.findById(req.params.id)
    .populate("host attendees", "name email avatar");
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  res.json(meeting);
}

export async function createMeeting(req, res) {
  const { title, description, provider, startTime, endTime, project, attendees, recurring } = req.body || {};
  requireFields(req.body, "title", "startTime");
  
  let joinUrl = provider === "jitsi" || !provider ? generateJitsiUrl(title) : req.body.joinUrl;

  if (provider === "zoom") {
    const integration = await Integration.findOne({ workspace: req.user.activeWorkspace, provider: "zoom" });
    if (integration) {
      const zoomMeeting = await zoomService.createMeeting(integration.credentials.accessToken, { topic: title, startTime });
      joinUrl = zoomMeeting.join_url;
    }
  }

  const meeting = await Meeting.create({
    workspace: req.body.workspace || req.query.workspace,
    project, title, description,
    provider: provider || "jitsi",
    joinUrl, startTime, endTime,
    host: req.user.id,
    attendees: attendees || [],
    recurring,
  });
  await meeting.populate("host attendees", "name email avatar");
  res.status(201).json(meeting);
}

export async function updateMeeting(req, res) {
  const meeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate("host attendees", "name email avatar");
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  res.json(meeting);
}

export async function deleteMeeting(req, res) {
  const meeting = await Meeting.findByIdAndDelete(req.params.id);
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  res.json({ message: "Meeting deleted" });
}

export async function generateJoinLink(req, res) {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  meeting.joinUrl = generateJitsiUrl(meeting.title);
  await meeting.save();
  res.json({ joinUrl: meeting.joinUrl });
}

export async function endMeeting(req, res) {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  meeting.status = "ended";
  meeting.endTime = new Date();
  if (meeting.startTime) {
    meeting.duration = Math.round((meeting.endTime - new Date(meeting.startTime)) / 60000);
  }
  await meeting.save();
  res.json(meeting);
}

export async function saveNotes(req, res) {
  const { notes } = req.body || {};
  if (!notes) return res.status(400).json({ message: "Notes required" });
  const meeting = await Meeting.findByIdAndUpdate(
    req.params.id,
    { notes },
    { new: true }
  );
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });
  res.json(meeting);
}

export async function saveAiSummary(req, res) {
  const meeting = await Meeting.findById(req.params.id).populate("host attendees", "name");
  if (!meeting) return res.status(404).json({ message: "Meeting not found" });

  const meetingData = {
    title: meeting.title,
    date: meeting.startTime,
    duration: meeting.duration ? `${meeting.duration}min` : "30min",
    attendees: meeting.attendees.map((a) => a.name),
    notes: meeting.notes || "No notes provided",
  };

  const result = await ai.meetingSummary(meetingData);
  meeting.aiSummary = {
    summary: result.summary || result.keyPoints?.join(". "),
    keyPoints: result.keyPoints || [],
    decisions: result.decisions || [],
    actionItems: result.actionItems || [],
    generatedAt: new Date(),
  };
  meeting.notes = meeting.notes || result.summary;
  await meeting.save();
  res.json(meeting.aiSummary);
}
