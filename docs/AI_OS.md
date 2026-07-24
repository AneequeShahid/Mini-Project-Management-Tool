# AI-OS Multi-Agent Runtime

Detailed specifications of Pulse's orchestrator pipelines, specialist personas, self-reflection passes, and AI cost controls.

## Specialist Personas

* **Planner Agent**: Manages task priority and sprint scopes.
* **Architect Agent**: Proposes system schemas and ADR logs.
* **Developer Agent**: Implements clean code blocks and writes tasks.
* **Reviewer Agent**: Critiques PR structures and reviews code quality.
* **QA Agent**: Assesses boundary tests and stable conditions.
* **Manager Agent**: Monitors team health, milestones, and burnout metrics.

---

## AI Guardrails & Human Approvals

To protect production states, high-impact agent tools do not execute immediately:
1. When an agent requests a capability like `create_task` or `create_sprint`, the request is intercepted by [toolRegistry.ts](file:///c:/Users/Aneeque/Desktop/mini-project-management-tool/src/lib/toolRegistry.ts).
2. The parameters are stored in a database `proposals` table with status `Pending`.
3. Human engineers review the details at `/dashboard/guardrails` to manually click **Authorize** or **Deny**.
