// Vector store abstraction supporting Qdrant and Chroma
// Configure via env vars: VECTOR_STORE=qdrant|chroma, plus provider-specific vars

let client = null;
let initialized = false;

export async function initVectorStore() {
  if (initialized) return client;
  const store = process.env.VECTOR_STORE || "";
  if (!store) return null;

  if (store === "qdrant") {
    const url = process.env.QDRANT_URL || "http://localhost:6333";
    const apiKey = process.env.QDRANT_API_KEY || "";
    try {
      const { QdrantClient } = await import("@qdrant/js-client-rest");
      client = new QdrantClient({ url, apiKey: apiKey || undefined });
      initialized = true;
      console.log("Qdrant vector store initialized");
    } catch (err) {
      console.error("Qdrant init error:", err.message);
    }
  } else if (store === "chroma") {
    const url = process.env.CHROMA_URL || "http://localhost:8000";
    try {
      const { ChromaClient } = await import("chromadb");
      client = new ChromaClient({ path: url });
      initialized = true;
      console.log("Chroma vector store initialized");
    } catch (err) {
      console.error("Chroma init error:", err.message);
    }
  }
  return client;
}

export async function upsertVectors(collection, points) {
  const store = process.env.VECTOR_STORE || "";
  if (!store || !client) return;

  try {
    if (store === "qdrant") {
      const { QdrantClient } = await import("@qdrant/js-client-rest");
      await client.upsert(collection, { points });
      await client.createCollection(collection, { vectors: { size: 1536, distance: "Cosine" } }).catch(() => {});
    } else if (store === "chroma") {
      const collection_ = await client.getOrCreateCollection({ name: collection });
      await collection_.upsert(
        points.map((p) => ({ id: p.id, embedding: p.vector, metadata: p.payload }))
      );
    }
  } catch (err) {
    console.error("Vector store upsert error:", err.message);
  }
}

export async function searchVectors(collection, vector, limit = 10) {
  const store = process.env.VECTOR_STORE || "";
  if (!store || !client) return [];

  try {
    if (store === "qdrant") {
      const result = await client.search(collection, { vector, limit, with_payload: true });
      return result.map((r) => ({ id: r.id, score: r.score, payload: r.payload }));
    } else if (store === "chroma") {
      const collection_ = await client.getCollection({ name: collection });
      const result = await collection_.query({ queryEmbeddings: [vector], nResults: limit });
      return result.ids[0].map((id, i) => ({ id, score: result.distances[0][i], payload: result.metadatas[0][i] }));
    }
  } catch (err) {
    console.error("Vector store search error:", err.message);
  }
  return [];
}

export async function deleteVectors(collection, ids) {
  const store = process.env.VECTOR_STORE || "";
  if (!store || !client) return;
  try {
    if (store === "qdrant") await client.delete(collection, { points: ids });
    else if (store === "chroma") {
      const collection_ = await client.getCollection({ name: collection });
      await collection_.delete({ ids });
    }
  } catch (err) {
    console.error("Vector store delete error:", err.message);
  }
}

export async function addToVectorStore(collection, id, vector, payload) {
  return upsertVectors(collection, [{ id, vector, payload }]);
}

export async function searchVectorStore(collection, vector, limit = 10) {
  return searchVectors(collection, vector, limit);
}
