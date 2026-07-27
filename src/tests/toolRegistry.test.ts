import { describe, it, expect, vi } from "vitest";
import { toolRegistry } from "@/lib/toolRegistry";

vi.mock("@/lib/supabaseServer", () => {
  return {
    supabaseServer: {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: "test-id" }, error: null })
          })
        })
      })
    }
  };
});

describe("AI Tool Registry Guardrails", () => {
  it("should list available tools in system format", () => {
    const definitions = toolRegistry.getToolDefinitions();
    expect(definitions.length).toBeGreaterThan(0);
    expect(definitions[0].type).toBe("function");
    expect(definitions[0].function.name).toBeDefined();
  });

  it("should intercept high-impact action and queue it in proposals", async () => {
    const response = await toolRegistry.executeTool("create_task", {
      projectId: "test-project-uuid",
      title: "Integrate Test Suites",
    });

    expect(response.status).toBe("Proposed");
    expect(response.proposalId).toBe("test-id");
    expect(response.message).toContain("intercepted");
  });
});
