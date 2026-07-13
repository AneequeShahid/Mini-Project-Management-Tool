import { Integration } from "../models/integration.js";
import { gitService } from "../services/gitService.js";
import { calendarService } from "../services/calendarService.js";
import { GitRepo } from "../models/gitRepo.js";

export async function listIntegrations(req, res) {
  const integrations = await Integration.find({ workspace: req.params.workspaceId });
  res.json(integrations);
}

export async function createIntegration(req, res) {
  const { provider, credentials, settings } = req.body;
  const integration = await Integration.create({ workspace: req.params.workspaceId, provider, credentials, settings, createdBy: req.user.id });
  res.status(201).json(integration);
}

export async function updateIntegration(req, res) {
  const integration = await Integration.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!integration) return res.status(404).json({ message: "Integration not found" });
  res.json(integration);
}

export async function deleteIntegration(req, res) {
  const integration = await Integration.findByIdAndDelete(req.params.id);
  if (!integration) return res.status(404).json({ message: "Integration not found" });
  res.json({ message: "Integration deleted" });
}

export async function syncIntegration(req, res) {
  const integration = await Integration.findById(req.params.id);
  if (!integration) return res.status(404).json({ message: "Integration not found" });

  try {
    const { provider, credentials } = integration;
    let result = null;

    if (provider === "github" || provider === "gitlab" || provider === "gitea" || provider === "forgejo") {
      // For git, we might need the specific repo. 
      // Assuming the integration has the repo info in settings or we sync all repos.
      const repos = await GitRepo.find({ workspace: integration.workspace });
      const syncResults = await Promise.all(repos.map(repo => gitService.syncRepo(repo, credentials.accessToken)));
      result = { reposSynced: syncResults.length, details: syncResults };
    } else if (provider === "google-calendar" || provider === "outlook") {
      result = await calendarService.syncEvents(integration.workspace, provider, credentials.accessToken);
    } else {
      result = { message: `Sync not implemented for provider: ${provider}` };
    }

    integration.lastSyncAt = new Date();
    await integration.save();
    res.json({ message: "Sync completed", result, integration });
  } catch (e) {
    res.status(500).json({ message: "Sync failed", error: e.message });
  }
}

export async function getCalendarEvents(req, res) {
  try {
    const workspaceId = req.headers["x-workspace-id"] || req.user.activeWorkspace;
    if (!workspaceId) return res.json([]);

    const integration = await Integration.findOne({ 
      workspace: workspaceId, 
      provider: { $in: ["google-calendar", "outlook"] } 
    });
    if (!integration) return res.json([]);

    const { provider, credentials } = integration;
    if (!credentials?.accessToken) return res.json([]);

    const events = await calendarService.syncEvents(integration.workspace, provider, credentials.accessToken);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch calendar events", error: err.message });
  }
}
