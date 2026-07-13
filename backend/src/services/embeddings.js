import OpenAI from "openai";

function getClient() {
  const baseURL = process.env.EMBEDDING_API_URL || process.env.AI_API_URL || "https://api.openai.com/v1";
  const apiKey = process.env.EMBEDDING_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  
  if (baseURL.includes("openrouter.ai") && !process.env.EMBEDDING_API_URL) {
    if (process.env.OPENAI_API_KEY) {
      return new OpenAI({ baseURL: "https://api.openai.com/v1", apiKey: process.env.OPENAI_API_KEY });
    }
    return null;
  }
  
  if (!apiKey) return null;
  return new OpenAI({ baseURL, apiKey });
}

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || process.env.AI_EMBEDDING_MODEL || "text-embedding-3-small";

let cachedEmbeddings = [];

export function setCachedData(data) {
  cachedEmbeddings = data;
}

export async function embed(text) {
  const client = getClient();
  if (!client) return [];
  const res = await client.embeddings.create({ model: EMBEDDING_MODEL, input: text });
  return res.data[0].embedding;
}

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

export async function semanticSearch(query, topK = 5) {
  const queryVec = await embed(query);
  if (!queryVec.length || !cachedEmbeddings.length) return [];

  const scored = cachedEmbeddings
    .map((item) => ({ ...item, score: cosineSimilarity(queryVec, item.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map(({ vector, ...rest }) => rest);
}
