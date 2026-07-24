import { describe, it, expect } from "vitest";
import { POST as mcpPost } from "@/app/api/mcp/route";
import { GET as triageGet, POST as triagePost } from "@/app/api/triage/route";
import { POST as decomposePost } from "@/app/api/ai/decompose/route";
import { POST as webhookPost } from "@/app/api/webhooks/github/route";

function createMockRequest(body: any, headers: Record<string, string> = {}) {
  const headerMap = new Map<string, string>();
  Object.entries(headers).forEach(([k, v]) => headerMap.set(k.toLowerCase(), v));

  return {
    json: async () => body,
    headers: {
      get: (name: string) => headerMap.get(name.toLowerCase()) || null,
    },
  } as unknown as Request;
}

describe("Next-Gen AI PM Capabilities Test Suite", () => {
  // 1. MCP Endpoint
  it("should respond to MCP tools/list via JSON-RPC 2.0", async () => {
    const req = createMockRequest({
      jsonrpc: "2.0",
      id: "1",
      method: "tools/list",
    });
    const res = await mcpPost(req);
    const data = await res.json();

    expect(data.jsonrpc).toBe("2.0");
    expect(data.id).toBe("1");
    expect(data.result.tools).toBeDefined();
    expect(data.result.tools.some((t: any) => t.name === "search_engineering_memory")).toBe(true);
  });

  it("should execute search_engineering_memory tool via MCP tools/call", async () => {
    const req = createMockRequest({
      jsonrpc: "2.0",
      id: "2",
      method: "tools/call",
      params: {
        name: "search_engineering_memory",
        arguments: { query: "database" },
      },
    });
    const res = await mcpPost(req);
    const data = await res.json();

    expect(data.jsonrpc).toBe("2.0");
    expect(data.result).toBeDefined();
    expect(data.result.content[0].text).toContain("Database");
  });

  // 2. Autonomous Triage & Duplicate Detection
  it("should list triage items and handle POST with duplicate detection", async () => {
    const getRes = await triageGet();
    const getData = await getRes.json();
    expect(getData.success).toBe(true);
    expect(getData.items.length).toBeGreaterThan(0);

    const req = createMockRequest({
      title: "Auth token refresh fails after 1hr idle",
      description: "Authentication token drops unexpectedly when user is idle.",
      source: "User Feedback",
    });
    const postRes = await triagePost(req);
    const postData = await postRes.json();

    expect(postData.id).toBeDefined();
    expect(postData.ai_triage.is_duplicate).toBe(true);
    expect(postData.ai_triage.similarity_score).toBeGreaterThanOrEqual(0.4);
  });

  // 3. AI Task Auto-Decomposition
  it("should decompose high-level requirements into subtasks and draft ADR", async () => {
    const req = createMockRequest({
      requirement: "Implement OAuth2 Google Login for Enterprise SSO",
      projectId: "proj-1",
    });
    const res = await decomposePost(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.subtasks.length).toBe(3);
    expect(data.data.draftADR).toBeDefined();
    expect(data.data.draftADR.status).toBe("Proposed");
  });

  // 4. GitHub PR Webhook Sync
  it("should process pull_request webhook and extract linked task status updates", async () => {
    const req = createMockRequest(
      {
        action: "opened",
        pull_request: {
          number: 104,
          title: "Fix(auth): Resolve tri-1 token expiration bug",
          body: "Fixes tri-1 by introducing refresh tokens.",
          head: { ref: "feature/tri-1-auth-fix" },
        },
        sender: { login: "octocat" },
      },
      { "x-github-event": "pull_request" }
    );

    const res = await webhookPost(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.event).toBe("pull_request");
    expect(data.linkedTaskId).toBe("tri-1");
  });
});
