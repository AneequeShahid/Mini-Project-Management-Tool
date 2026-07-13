import { MLOpsModel } from "../models/mlopsModel.js";
import { requireFields } from "../utils/validators.js";

export async function listModels(req, res) {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.provider) filter.provider = req.query.provider;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  const models = await MLOpsModel.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 });
  res.json(models);
}

export async function getModel(req, res) {
  const model = await MLOpsModel.findById(req.params.id).populate("createdBy", "name email");
  if (!model) return res.status(404).json({ message: "Model not found" });
  res.json(model);
}

export async function createModel(req, res) {
  const { name, provider, modelId, version, type, config, promptTemplates } = req.body || {};
  requireFields(req.body, "name", "provider", "modelId");
  const mlModel = await MLOpsModel.create({
    workspace: req.body.workspace || req.query.workspace,
    name, provider, modelId, version: version || "1.0",
    type: type || "chat", config: config || {},
    promptTemplates: promptTemplates || [],
    createdBy: req.user.id,
  });
  res.status(201).json(mlModel);
}

export async function updateModel(req, res) {
  const model = await MLOpsModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!model) return res.status(404).json({ message: "Model not found" });
  res.json(model);
}

export async function deleteModel(req, res) {
  const model = await MLOpsModel.findByIdAndDelete(req.params.id);
  if (!model) return res.status(404).json({ message: "Model not found" });
  res.json({ message: "Model deleted" });
}

export async function getUsageStats(req, res) {
  const models = await MLOpsModel.find({ workspace: req.query.workspace });
  const stats = {
    totalRequests: models.reduce((s, m) => s + (m.usageStats?.totalRequests || 0), 0),
    totalTokens: models.reduce((s, m) => s + (m.usageStats?.totalTokens || 0), 0),
    activeModels: models.filter((m) => m.status === "active").length,
    byProvider: {},
  };
  for (const model of models) {
    stats.byProvider[model.provider] = (stats.byProvider[model.provider] || 0) + 1;
  }
  res.json(stats);
}
