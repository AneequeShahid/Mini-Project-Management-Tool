# Platform Metrics & Benchmarks

Operational measurements and target performance profiles for Gravity's AI engines, database operations, and caching systems.

## Simulated Baseline Targets
> [!NOTE]
> The following metrics represent target performance profiles and simulated baselines designed for local sandbox evaluation. They serve as design benchmarks before production deployment measurements are gathered.

| Metric | Target / Simulated Baseline | Test Configuration |
| :--- | :--- | :--- |
| **API Latency** | `< 250ms` | Next.js API Routes hosted on Vercel |
| **AI Handshake Latency** | `1.2s - 2.5s` | OpenRouter gateway + RAG lookup |
| **Hybrid Search Latency** | `< 120ms` | pgvector query + Re-ranking pass |
| **Tool Calling Success** | `> 99.5%` | Automated validation test suites |
| **Cache Hit Rate** | `> 90%` | Redis key-value cache layer |
| **Reranking Overhead** | `~ 300ms` | Small parameter LLM model sorting |

## Simulated Cost Profile

* Estimated cost per user transaction (RAG search + tool call + reflection pass): **$0.0004**.
* Monitored dynamically inside the `/dashboard/observability` control deck.
