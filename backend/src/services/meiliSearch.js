let client = null;

async function getClient() {
  if (client) return client;
  const host = process.env.MEILI_HOST || "http://localhost:7700";
  const apiKey = process.env.MEILI_API_KEY || "";
  if (!apiKey && !process.env.MEILI_HOST) return null;
  try {
    const { MeiliSearch } = await import("meilisearch");
    client = new MeiliSearch({ host, apiKey });
    return client;
  } catch { return null; }
}

const INDEXES = {
  tasks: "pm_tasks",
  projects: "pm_projects",
  documents: "pm_documents",
};

export async function indexTask(task) {
  const c = await getClient();
  if (!c) return;
  try {
    const index = c.index(INDEXES.tasks);
    await index.addDocuments([{
      id: task._id.toString(),
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      issueType: task.issueType,
      project: task.project?.toString() || "",
      assignee: task.assignee?.name || "",
      labels: task.labels || [],
      createdAt: task.createdAt,
    }]);
  } catch (err) { console.error("MeiliSearch index error:", err.message); }
}

export async function indexProject(project) {
  const c = await getClient();
  if (!c) return;
  try {
    const index = c.index(INDEXES.projects);
    await index.addDocuments([{
      id: project._id.toString(),
      name: project.name,
      description: project.description || "",
      status: project.status,
    }]);
  } catch (err) { console.error("MeiliSearch index error:", err.message); }
}

export async function indexDocument(doc) {
  const c = await getClient();
  if (!c) return;
  try {
    const index = c.index(INDEXES.documents);
    await index.addDocuments([{
      id: doc._id.toString(),
      title: doc.title,
      content: doc.content || "",
      workspace: doc.workspace?.toString() || "",
    }]);
  } catch (err) { console.error("MeiliSearch index error:", err.message); }
}

export async function searchMeili(query, options = {}) {
  const c = await getClient();
  if (!c) return null;
  const { indexes = Object.values(INDEXES), limit = 20 } = options;
  const results = {};
  for (const idx of indexes) {
    try {
      const res = await c.index(idx).search(query, { limit, highlightPreTag: "<mark>", highlightPostTag: "</mark>" });
      results[idx] = res;
    } catch { results[idx] = { hits: [] }; }
  }
  return results;
}

export async function deleteTaskIndex(id) {
  const c = await getClient();
  if (!c) return;
  try { await c.index(INDEXES.tasks).deleteDocument(id); } catch {}
}

export async function deleteProjectIndex(id) {
  const c = await getClient();
  if (!c) return;
  try { await c.index(INDEXES.projects).deleteDocument(id); } catch {}
}

export async function deleteDocumentIndex(id) {
  const c = await getClient();
  if (!c) return;
  try { await c.index(INDEXES.documents).deleteDocument(id); } catch {}
}
