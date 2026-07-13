import { adrService } from "./services/adrService.js";

async function initializeADRs() {
  await adrService.writeADR("001", "Use MongoDB as Primary Database", "Accepted", 
    "Need a flexible schema for project management and Knowledge Graph edges.", 
    "Use MongoDB with a custom GraphEdge model for relationships.", 
    "Rapid development, flexible schemas, but requires manual implementation of graph traversals.");

  await adrService.writeADR("002", "Event-Driven Architecture with Redis", "Accepted", 
    "Reducing coupling between core services (e.g., Task creation vs Notifications).", 
    "Use an internal EventBus linked to Redis Pub/Sub.", 
    "Highly decoupled services, better scalability, but harder to trace request flows.");

  await adrService.writeADR("003", "AI-OS Agentic Loop with Tool Calling", "Accepted", 
    "Move beyond simple prompting to autonomous action.", 
    "Implement a ToolRegistry and a reasoning loop that can execute functions.", 
    "AI can actually perform work, but requires strict human-in-the-loop approval for high-risk actions.");

  await adrService.writeADR("004", "Hybrid Vector+Keyword Search with LLM Re-ranking", "Accepted", 
    "Need high precision for technical project data retrieval.", 
    "Use Meilisearch for keyword + Vector search, then re-rank top candidates using a Cross-Encoder LLM prompt.", 
    "Extremely high retrieval quality, but increased latency and token cost.");
}

export { initializeADRs };
