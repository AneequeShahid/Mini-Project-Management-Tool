import { Plugin } from "../models/plugin.js";
import { requireFields } from "../utils/validators.js";

export async function listPlugins(req, res) {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.installed === "true") filter.isInstalled = true;
  const plugins = await Plugin.find(filter).sort({ downloads: -1 });
  res.json(plugins);
}

export async function getPlugin(req, res) {
  const plugin = await Plugin.findById(req.params.id);
  if (!plugin) return res.status(404).json({ message: "Plugin not found" });
  res.json(plugin);
}

export async function installPlugin(req, res) {
  const plugin = await Plugin.findByIdAndUpdate(
    req.params.id,
    { isInstalled: true, isEnabled: true, installedAt: new Date(), installedBy: req.user.id },
    { new: true }
  );
  if (!plugin) return res.status(404).json({ message: "Plugin not found" });
  res.json(plugin);
}

export async function uninstallPlugin(req, res) {
  const plugin = await Plugin.findByIdAndUpdate(
    req.params.id,
    { isInstalled: false, isEnabled: false },
    { new: true }
  );
  if (!plugin) return res.status(404).json({ message: "Plugin not found" });
  res.json(plugin);
}

export async function publishPlugin(req, res) {
  const { name, displayName, description, author, homepage, icon, type, category, permissions, configSchema } = req.body || {};
  requireFields(req.body, "name", "displayName", "description");
  const existing = await Plugin.findOne({ name });
  if (existing) return res.status(409).json({ message: "Plugin name already exists" });
  const plugin = await Plugin.create({
    name, displayName, description, author: author || req.user.name,
    homepage, icon, type: type || "community", category: category || "other",
    permissions: permissions || [], configSchema,
  });
  res.status(201).json(plugin);
}
