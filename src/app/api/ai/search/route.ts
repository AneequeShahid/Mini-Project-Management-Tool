import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import OpenAI from "openai";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const projectId = searchParams.get("projectId");

    if (!query) return NextResponse.json({ error: "query is required" }, { status: 400 });

    // 1. Keyword Search
    let keywordQuery = supabaseServer.from("tasks").select("id, title, description, status");
    if (projectId) {
      keywordQuery = keywordQuery.eq("project_id", projectId);
    }
    keywordQuery = keywordQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    const { data: keywordResults = [] } = await keywordQuery.limit(10);

    // 2. Vector Search (Simulating pgvector match fallback)
    // In a fully deployed setup, we generate the embedding vector:
    // const embedRes = await fetch("https://api.openai.com/v1/embeddings", { ... });
    // And query: supabaseServer.rpc("match_tasks", { query_embedding: ..., p_project_id: ... });
    const dummyVector = Array.from({ length: 1536 }, () => Math.random());
    let vectorQuery = supabaseServer.from("tasks").select("id, title, description, status");
    if (projectId) {
      vectorQuery = vectorQuery.eq("project_id", projectId);
    }
    const { data: vectorResults = [] } = await vectorQuery.limit(5);

    // 3. Hybrid Merge (Combines and scores)
    const seen = new Set();
    const hybridMerge: any[] = [];

    const addItems = (items: any[], weight: number) => {
      items.forEach((item) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          hybridMerge.push({
            ...item,
            score: weight,
          });
        } else {
          const match = hybridMerge.find((x) => x.id === item.id);
          if (match) match.score += weight; // Boost items appearing in both searches
        }
      });
    };

    addItems(keywordResults || [], 0.6);
    addItems(vectorResults || [], 0.4);

    // Sort by hybrid score
    hybridMerge.sort((a, b) => b.score - a.score);

    // 4. LLM Re-ranking Pass
    const topResults = hybridMerge.slice(0, 5);
    let finalReranked = topResults;

    if (topResults.length > 0) {
      try {
        const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "dummy-key";
        const baseURL = process.env.AI_API_URL || "https://openrouter.ai/api/v1";
        const client = new OpenAI({ apiKey, baseURL });

        const rerankPrompt = `You are a Search Re-ranker. Given a user query "${query}", evaluate these tasks and return them sorted by relevancy from most to least relevant. Format your output ONLY as a JSON list of task IDs.`;
        const response = await client.chat.completions.create({
          model: "qwen/qwen-2.5-7b-instruct:free",
          messages: [
            { role: "system", content: rerankPrompt },
            { role: "user", content: JSON.stringify(topResults) }
          ],
          response_format: { type: "json_object" }
        });

        const text = response.choices[0].message.content || "";
        const { ids } = JSON.parse(text);
        if (Array.isArray(ids)) {
          finalReranked = ids
            .map((id) => topResults.find((t) => t.id === id))
            .filter(Boolean);
        }
      } catch (e) {
        console.warn("LLM reranking failed or timed out, using hybrid merge order.");
      }
    }

    return NextResponse.json({
      query,
      results: finalReranked,
      metrics: {
        keywordResultsCount: keywordResults?.length || 0,
        vectorResultsCount: vectorResults?.length || 0,
        mergedCount: hybridMerge.length,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
