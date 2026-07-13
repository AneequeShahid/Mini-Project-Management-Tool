import { KnowledgeEntry } from "../models/knowledgeEntry.js";
import { embed } from "../services/embeddings.js";
import { addToVectorStore, searchVectorStore } from "../services/vectorStore.js";
import { requireFields } from "../utils/validators.js";

export async function listEntries(req, res) {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.project) filter.project = req.query.project;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.tag) filter.tags = req.query.tag;
  const entries = await KnowledgeEntry.find(filter)
    .populate("createdBy lastEditedBy", "name email avatar")
    .sort({ updatedAt: -1 });
  res.json(entries);
}

export async function getEntry(req, res) {
  const entry = await KnowledgeEntry.findById(req.params.id)
    .populate("createdBy lastEditedBy", "name email avatar");
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  res.json(entry);
}

export async function createEntry(req, res) {
  const { title, content, category, tags, project } = req.body || {};
  requireFields(req.body, "title", "content");
  const entry = await KnowledgeEntry.create({
    workspace: req.body.workspace || req.query.workspace,
    project, title, content,
    contentHtml: req.body.contentHtml || content,
    category, tags: tags || [],
    createdBy: req.user.id,
    lastEditedBy: req.user.id,
  });

  try {
    const vector = await embed(`${title} ${content}`);
    entry.embedding = vector;
    await entry.save();
    await addToVectorStore("knowledge", entry._id.toString(), vector, { title, category, project });
  } catch {
    // Vector indexing is optional; entry still created
  }

  res.status(201).json(entry);
}

export async function updateEntry(req, res) {
  const entry = await KnowledgeEntry.findById(req.params.id);
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  const { title, content, contentHtml, category, tags } = req.body || {};
  if (title) entry.title = title;
  if (content) entry.content = content;
  if (contentHtml) entry.contentHtml = contentHtml;
  if (category) entry.category = category;
  if (tags) entry.tags = tags;
  entry.lastEditedBy = req.user.id;
  entry.version += 1;
  await entry.save();

  try {
    const vector = await embed(`${entry.title} ${entry.content}`);
    entry.embedding = vector;
    await entry.save();
    await addToVectorStore("knowledge", entry._id.toString(), vector, { title: entry.title, category: entry.category });
  } catch {
    // Vector indexing is optional
  }

  res.json(entry);
}

export async function deleteEntry(req, res) {
  const entry = await KnowledgeEntry.findByIdAndDelete(req.params.id);
  if (!entry) return res.status(404).json({ message: "Entry not found" });
  res.json({ message: "Entry deleted" });
}

export async function semanticSearchKnowledge(req, res) {
  const { query, workspace, project, category } = req.query || {};
  if (!query) return res.status(400).json({ message: "Query required" });

  const filter = {};
  if (workspace) filter.workspace = workspace;
  if (project) filter.project = project;
  if (category) filter.category = category;

  try {
    const queryVec = await embed(query);
    const storeResults = await searchVectorStore("knowledge", queryVec, 10);
    if (storeResults?.length) {
      const ids = storeResults.map((r) => r.id);
      const entries = await KnowledgeEntry.find({ _id: { $in: ids }, ...filter })
        .populate("createdBy", "name").limit(10);
      return res.json({ results: entries, mode: "semantic" });
    }
  } catch {
    // Fall through to keyword
  }

  const keyword = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const entries = await KnowledgeEntry.find({
    ...filter,
    $or: [
      { title: { $regex: keyword, $options: "i" } },
      { content: { $regex: keyword, $options: "i" } },
      { tags: { $regex: keyword, $options: "i" } },
    ],
  }).populate("createdBy", "name").limit(10);
  res.json({ results: entries, mode: "keyword" });
}
