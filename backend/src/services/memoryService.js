import { Memory } from "../models/memory.js";
import { embed } from "./embeddings.js";

export const memoryService = {
  async saveMemory({ userId, projectId, type, content, metadata = {} }) {
    const embedding = await embed(content);
    const memory = await Memory.create({
      userId,
      projectId,
      type,
      content,
      metadata,
      embedding,
    });
    return memory;
  },

  async retrieveMemories({ userId, projectId, query, type = null, limit = 5 }) {
    const queryEmbedding = await embed(query);
    
    const filter = { userId };
    if (projectId) filter.projectId = projectId;
    if (type) filter.type = type;

    const memories = await Memory.find(filter).limit(100); // Get candidates
    
    // Simple cosine similarity for retrieval (since we aren't using a dedicated Vector DB yet)
    const scored = memories.map(m => ({
      memory: m,
      score: this.cosineSimilarity(m.embedding, queryEmbedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

    return scored.map(s => ({
      id: s.memory._id,
      type: s.memory.type,
      content: s.memory.content,
      metadata: s.memory.metadata,
      score: s.score
    }));
  },

  cosineSimilarity(a, b) {
    if (!a || !b) return 0;
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
  },

  async clearMemories(userId, projectId = null) {
    const filter = { userId };
    if (projectId) filter.projectId = projectId;
    return await Memory.deleteMany(filter);
  }
};
