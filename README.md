# Gravity — AI-Native Project Intelligence Platform

> **An AI Operating System for modern software engineering teams.**

Gravity is an AI-native Project Intelligence Platform designed to move beyond traditional project management. Instead of simply tracking tasks, Gravity understands project context, reasons over historical decisions, automates engineering workflows, and assists teams through specialized AI agents.

Unlike conventional tools that treat AI as an add-on chatbot, Gravity integrates AI into the core architecture through an event-driven system, semantic memory, hybrid retrieval, human approval workflows, and multi-agent orchestration.

---

# Vision

Modern engineering teams generate enormous amounts of information:

* Tasks
* Pull Requests
* Architecture Decisions
* Sprint plans
* Meeting notes
* Comments
* Documentation
* Commits
* Deployment logs

Most of this knowledge becomes fragmented across multiple tools.

Gravity transforms these disconnected events into an intelligent knowledge system capable of answering questions, explaining historical decisions, predicting project risks, and automating repetitive engineering work.

---

# Key Features

## AI Operating System

Gravity introduces an AI Operating System built around specialized agents rather than a single general-purpose assistant.

Available personas include:

* Planner
* Architect
* Developer
* Reviewer
* QA
* Manager
* Researcher

Each agent maintains:

* Dedicated system instructions
* Model configuration
* Tool access
* Context retrieval
* Evaluation metrics
* Confidence scoring

Requests are routed through an Agent Orchestrator which selects the appropriate persona, gathers project context, invokes tools when necessary, and returns the final response.

---

## AI Tool Calling

Gravity enables AI agents to perform structured actions instead of producing text alone.

Examples include:

* Create Sprint
* Create Task
* Generate Architecture Decision Record
* Estimate Sprint Scope
* Prioritize Backlog

High-impact actions are protected through a Human Approval Queue before execution.

---

## Human Approval Guardrails

AI-generated changes are not executed automatically.

Instead, Gravity intercepts sensitive actions and creates pending proposals.

Reviewers can:

* Inspect generated parameters
* Approve execution
* Reject requests
* Audit previous proposals

This keeps humans in control while still benefiting from AI automation.

---

# Engineering Memory

Engineering Memory is Gravity's signature capability.

Instead of relying only on chat history, Gravity retrieves project knowledge from multiple sources.

When a user asks:

> "Why did we migrate from MongoDB to PostgreSQL?"

Gravity searches:

* Architecture Decision Records
* Timeline Events
* Audit Logs
* Tasks
* Related project history

The retrieved context is synthesized into a coherent explanation describing:

* Decision rationale
* Authors
* Timeline
* Related implementation work
* Outcome

This allows the platform to explain engineering decisions rather than simply recalling conversations.

---

# Hybrid Retrieval-Augmented Generation

Gravity combines multiple retrieval strategies.

User Query

↓

Keyword Search

*

Vector Similarity Search

↓

Result Fusion

↓

LLM Re-ranking

↓

Context Builder

↓

Final AI Response

This hybrid pipeline improves retrieval quality over vector-only approaches.

---

# Knowledge Graph

Gravity maintains relationships between engineering entities.

Nodes include:

* Organizations
* Workspaces
* Projects
* Sprints
* Tasks
* Developers
* Pull Requests
* Documents
* ADRs
* AI Agents

Relationships are visualized through an interactive graph, enabling exploration of project dependencies and engineering history.

---

# Event-Driven Architecture

Everything inside Gravity is modeled as an event.

Examples:

* Task Created
* Sprint Updated
* Pull Request Merged
* Proposal Approved
* AI Tool Executed
* Memory Updated

Events are published to a central Event Bus where subscribers update independent systems including:

* Timeline
* Analytics
* Notifications
* Engineering Memory
* Project Wrapped

This decoupled architecture allows new capabilities to subscribe to events without modifying existing modules.

---

# Project Wrapped

Inspired by annual productivity summaries, Project Wrapped transforms engineering activity into an interactive narrative.

Metrics include:

* Tasks completed
* Longest productivity streak
* Peak working hours
* AI usage
* Sprint achievements
* Code review statistics
* Project milestones

Wrapped is generated from historical events rather than manually tracked counters.

---

# Observability

Gravity tracks operational metrics across the platform.

Examples include:

* AI latency
* Token usage
* Estimated inference cost
* Cache statistics
* Tool execution metrics
* Event throughput

These insights provide visibility into both system performance and AI behavior.

---

# Architecture Decision Records

Architecture Decision Records document important technical decisions.

The Architect Agent can draft proposals which are reviewed, approved, or archived.

This creates a searchable history explaining why significant architectural changes occurred.

---

# Technology Stack

## Frontend

* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS v4
* React
* Motion
* Recharts

## Backend

* Next.js Route Handlers
* Supabase PostgreSQL
* pgvector
* Row-Level Security (RLS)

## AI

* OpenRouter
* Multi-Agent Orchestration
* Tool Registry
* Hybrid RAG
* Engineering Memory

## Infrastructure

* Vercel
* Supabase
* Event Bus
* Audit Trail

## Testing

* Vitest

---

# High-Level Architecture

Experience Layer

↓

Application Layer

↓

AI Operating System

↓

Knowledge Layer

↓

Automation Layer

↓

Infrastructure Layer

## Experience Layer

* Dashboard
* Projects
* Tasks
* AI Copilot
* Wrapped
* Timeline
* Analytics
* Knowledge Graph
* Guardrails
* Engineering Memory

## AI Operating System

* Planner
* Architect
* Developer
* Reviewer
* QA
* Manager
* Researcher

## Knowledge Layer

* Hybrid Retrieval
* Semantic Search
* Engineering Memory
* Knowledge Graph
* Audit Trail

## Automation Layer

* Event Bus
* Workflow Integrations
* Notifications
* External Webhooks

## Infrastructure Layer

* Next.js
* Supabase
* PostgreSQL
* pgvector
* Vercel

---

# Repository Structure

```text
src/
├── app/
├── components/
├── agents/
├── lib/
├── memory/
├── rag/
├── toolRegistry/
├── analytics/
├── observability/
├── timeline/
├── wrapped/
├── knowledge/
├── guardrails/
├── services/
├── tests/
└── docs/
```

---

# Running the Project

1. Clone the repository.
2. Install dependencies.
3. Configure environment variables.
4. Run database migrations.
5. Start the development server.
6. Visit the local application.

Production builds can be generated using the standard Next.js build process.

---

# Current Status

Gravity is a portfolio and research platform demonstrating modern AI-assisted software engineering concepts.

Implemented capabilities include:

* Multi-agent orchestration
* AI tool execution
* Human approval workflows
* Engineering Memory
* Hybrid retrieval
* Knowledge Graph visualization
* Event-driven architecture
* Project Wrapped
* Observability dashboards
* Architecture Decision Records
* Comprehensive documentation
* Automated testing

Some predictive analytics components are currently implemented as prototype pipelines for architectural demonstration and are documented accordingly.

---

# Future Roadmap

Potential future work includes:

* Training project-specific machine learning models for delivery forecasting
* Expanded workflow automation integrations
* Enhanced collaborative editing
* Additional engineering analytics
* Richer AI evaluation benchmarks
* Production-scale distributed event processing

---

# License

This repository is intended as an educational and portfolio project demonstrating modern software architecture, AI integration, and engineering best practices.
