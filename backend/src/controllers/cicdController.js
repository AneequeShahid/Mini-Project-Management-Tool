import { CICDPipeline } from "../models/cicdPipeline.js";
import { requireFields } from "../utils/validators.js";

export async function listPipelines(req, res) {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.project) filter.project = req.query.project;
  if (req.query.status) filter.status = req.query.status;
  const pipelines = await CICDPipeline.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(pipelines);
}

export async function getPipeline(req, res) {
  const pipeline = await CICDPipeline.findById(req.params.id);
  if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });
  res.json(pipeline);
}

export async function createPipeline(req, res) {
  const { name, provider, branch, project } = req.body || {};
  requireFields(req.body, "name", "provider");
  const pipeline = await CICDPipeline.create({
    workspace: req.body.workspace || req.query.workspace,
    project, name, provider, branch,
    triggeredBy: req.body.triggeredBy || "manual",
    startedAt: new Date(),
  });
  res.status(201).json(pipeline);
}

export async function updatePipeline(req, res) {
  const pipeline = await CICDPipeline.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });
  res.json(pipeline);
}

export async function deletePipeline(req, res) {
  const pipeline = await CICDPipeline.findByIdAndDelete(req.params.id);
  if (!pipeline) return res.status(404).json({ message: "Pipeline not found" });
  res.json({ message: "Pipeline deleted" });
}

export async function handleWebhook(req, res) {
  const { provider, event, payload } = req.body || {};
  if (!provider || !event) return res.status(400).json({ message: "Provider and event required" });
  const pipeline = await CICDPipeline.create({
    workspace: req.body.workspace,
    provider,
    name: `${provider} - ${event}`,
    status: "running",
    webhookPayload: payload,
    triggeredBy: "push",
    startedAt: new Date(),
  });
  res.status(201).json(pipeline);
}
