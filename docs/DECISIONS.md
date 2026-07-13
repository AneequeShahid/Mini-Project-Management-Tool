# Gravity: Engineering Decision Records (ADRs)

This document outlines the "Why" behind the architectural choices made in Gravity.

## 📂 Case Study 1: Why a Knowledge Graph instead of Flat Documents?

**Problem**: Standard project management tools store tasks as a list. However, software projects are actually a web of dependencies. Answering *"Who knows the most about the Billing module?"* or *"Which ADR introduced this breaking change?"* is nearly impossible with flat queries.

**Solution**: I implemented a **Knowledge Graph** using a `GraphEdge` model. Every entity (User, Task, PR, ADR) is a node, and every relationship is a directed, labeled edge.

**Trade-off**: 
- **Cost**: Higher complexity in data ingestion.
- **Benefit**: Enables "Graph Traversal" (BFS/DFS), allowing the AI to discover hidden bottlenecks and map the "Blast Radius" of a change.

## 📂 Case Study 2: Why a Multi-Agent OS instead of a Single Prompt?

**Problem**: Single LLM prompts suffer from "Attention Drift" and hallucinations when asked to perform multiple roles (e.g., Planning AND Coding AND QA).

**Solution**: I built an **AI-OS** with specialized personas. The **Router Agent** dynamically assigns a request to a pipeline (e.g., Architect $\rightarrow$ Developer $\rightarrow$ QA).

**Trade-off**:
- **Cost**: Increased token usage due to multiple passes.
- **Benefit**: Dramatic increase in accuracy and quality. The **Critic Agent** provides a final layer of verification, reducing hallucinations by ensuring the answer is grounded in the retrieved context.

## 📂 Case Study 3: Why an Event-Driven Architecture?

**Problem**: In a monolithic flow, creating a task requires calling the DB, then the Notification service, then the Search Index, then the AI. If one fails, the whole request fails.

**Solution**: I implemented an **Event Bus**. The Task Service simply publishes a `TASK_CREATED` event. The Notification, Search, and AI services subscribe to that event and react independently.

**Trade-off**:
- **Cost**: Eventual consistency (the search index might be a few milliseconds behind).
- **Benefit**: Extreme scalability and loose coupling. Adding a new feature (like a "Daily Digest") requires zero changes to the core Task logic.

## 📂 Case Study 4: Why Hybrid Search (BM25 + Vector + Reranking)?

**Problem**: Vector search is great for "concepts" but terrible for "exact keywords" (e.g., searching for a specific Ticket ID like `PROJ-123`).

**Solution**: I implemented a **Hybrid Pipeline**:
1. **Retrieval**: Keyword search + Semantic search.
2. **Reranking**: The top 20 candidates are passed to a "Cross-Encoder" LLM prompt that re-orders them based on precise relevance.

**Result**: This ensures that the AI always has the most accurate context before it starts reasoning.
