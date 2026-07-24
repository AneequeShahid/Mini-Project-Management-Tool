# Pulse v2 — Master System Architecture Specification

## 1. High-Level Philosophy
In **Pulse v2**, the platform shifts from a classic CRUD project management interface to an **AI-Native Project Intelligence Platform**. Every action, state transition, and background sync is modeled as an **Event** dispatched onto a central **Event Bus**. Subsystems subscribe to this event stream to trigger analytics, audit trails, and automated workflows asynchronously.

---

## 2. Platform Layer Overview

```
                      Experience Layer
───────────────────────────────────────────────────────────
 Next.js 15 App Router // Tailwind v4 // framer-motion UI
 Dashboard // Wrapped Slideshow // Knowledge Graph Visuals

                              │
                              ▼

                      AI Operating System
───────────────────────────────────────────────────────────
 Agent Orchestrator // Self Reflection Reviewer Hooks
 Specialist Agent Personas // AI Guardrails Interceptor

                              │
                              ▼

                       Knowledge Layer
───────────────────────────────────────────────────────────
 pgvector Hybrid RAG // Engineering Memory Query Engine
 Relational Node-Edge Knowledge Graph Mapper

                              │
                              ▼

                     Automation & Infrastructure
───────────────────────────────────────────────────────────
 Event Bus Reactor // n8n Webhook Outlets
 Supabase RLS // OpenRouter Cloud Reasoning Gateway
```

---

## 3. Central System: The Event Bus Reactor

To decouple systems and prevent spaghetti code blocks, Pulse v2 implements the **Event Bus** as the core architectural heartbeat:

```
    GitHub Webhook / UI Action
                 │
                 ▼
             Event Bus
                 │
  ┌──────────────┼──────────────┬──────────────┬──────────────┐
  ▼              ▼              ▼              ▼              ▼
Timeline       Memory       Analytics       Wrapped     Notifications
  │
  ▼
AI Orchestrator ──> n8n workflows
```

* **Decoupled Architecture**: Subsystems subscribe to the Event Bus stream. Adding new analytics hooks or third-party webhooks requires zero code changes inside the core application logic.
* **Synchronized State**: The Knowledge Graph, Spotify-style Wrapped slide numbers, and the Engineering Memory indices update automatically from the identical, chronological event log stream.

---

## 4. Modular Directory Design (`src/`)

```
src/
├── app/                  # Next.js 15 routing pages and API routes
├── components/           # Glassmorphic shadcn UI components
├── lib/                  # Database, Event Bus, and client singletons
├── agents/               # Orchestrator and agent persona templates
├── memory/               # Context recall and semantic storage hooks
├── RAG/                  # Keyword + vector search algorithms
├── automation/           # n8n webhook dispatches and event mapping
├── toolRegistry/         # Interceptor schemas and execution scripts
├── observability/        # Observability stats and latency logging
├── analytics/            # Burnout risks and story points metrics
├── wrapped/              # Wrapped slide generators
├── timeline/             # Audit logs and event histories
├── knowledge/            # SVG graph mapping algorithms
└── guardrails/           # Human approval queue dashboards
```
