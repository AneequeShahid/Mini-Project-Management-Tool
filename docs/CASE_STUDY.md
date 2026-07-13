# Gravity Technical Case Study

An analysis of system design decisions, technology selection trade-offs, and architecture justifications.

---

## 1. Why Next.js 15 instead of Express?
* **Problem**: Express requires maintaining a decoupled Client Single Page Application (SPA) and API backend server separately, increasing deployment latency, CORS configuration overhead, and context-switching overhead.
* **Resolution**: Migrated to Next.js 15 App Router. This unified client rendering layouts with Server API Routes inside a single codebase, improving page render velocities and standardizing TypeScript interfaces between client-side components and server operations.

---

## 2. Why PostgreSQL instead of MongoDB?
* **Problem**: While MongoDB's document-model matches unstructured tasks easily, project management systems are relational at their core. Tasks depend on sprints, sprints belong to projects, and developers are mapped to workspaces.
* **Resolution**: PostgreSQL guarantees strict referential integrity (foreign keys) and transactional consistency (ACID). Standardizing on PostgreSQL prevented orphaned records and complex application-level relationship join queries.

---

## 3. Why pgvector instead of a standalone vector database?
* **Problem**: Storing task vectors in a separate vector database (like Qdrant or Pinecone) requires complex synchronization pipelines, making transactional rollbacks prone to state desynchronizations.
* **Resolution**: Using `pgvector` inside PostgreSQL allows storing vectors in the same table as task metadata. This allows querying task descriptions, statuses, and vector similarities inside a single SQL query, keeping operations transactionally secure.

---

## 4. Why use a Knowledge Graph?
* **Problem**: Relational databases struggle to query deep, recursive relationship chains (e.g. finding how a task is linked to a pull request, which is linked to a developer, who approved an ADR) without executing multiple complex relational joins.
* **Resolution**: The SVG Knowledge Graph visualizes relational connections on-the-fly, giving managers immediate insight into blockers and architectural dependencies.

---

## 5. Why introduce Human Approval for AI tool execution?
* **Problem**: AI models can hallucinate parameters or execute destructive database modifications (like deleting tasks or creating erroneous sprints) when allowed to run tools autonomously.
* **Resolution**: We built an AI Guardrails interceptor queue. High-impact tools do not run automatically; parameters are staged as `Pending` proposals in Supabase, requiring human engineers to review and authorize execution.

---

## 6. Why a Hybrid RAG pipeline instead of vector search alone?
* **Problem**: Vector searches excel at conceptual queries but perform poorly on specific keyword lookups (e.g. matching specific IDs or ticket labels like "PR #122").
* **Resolution**: Gravity merges keyword index matches with pgvector cosine similarity calculations, passing the top results to a small LLM model for a final re-ranking pass.
