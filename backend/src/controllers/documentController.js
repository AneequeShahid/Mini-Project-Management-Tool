import { Document } from "../models/document.js";

export async function listDocuments(req, res) {
  const filter = { workspace: req.params.workspaceId };
  if (req.query.project) filter.project = req.query.project;
  const docs = await Document.find(filter).populate("createdBy lastEditedBy", "name email avatar").sort({ updatedAt: -1 });
  res.json(docs);
}

export async function getDocument(req, res) {
  const doc = await Document.findById(req.params.id).populate("createdBy lastEditedBy", "name email avatar");
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json(doc);
}

export async function createDocument(req, res) {
  const { title, content, contentType, icon, project, parent } = req.body;
  const doc = await Document.create({ workspace: req.params.workspaceId, title, content, contentType, icon, project, parent, createdBy: req.user.id, lastEditedBy: req.user.id });
  res.status(201).json(doc);
}

export async function updateDocument(req, res) {
  const doc = await Document.findByIdAndUpdate(req.params.id, { ...req.body, lastEditedBy: req.user.id }, { new: true });
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json(doc);
}

export async function deleteDocument(req, res) {
  await Document.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
}
