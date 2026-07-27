import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventBus } from "@/lib/eventBus";

vi.mock("@/lib/supabaseServer", () => {
  return {
    supabaseServer: {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: "event-id" }, error: null })
          })
        })
      })
    }
  };
});

describe("Server Event Bus Reactor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should publish system events to database and active streams", async () => {
    await expect(
      EventBus.publish({
        action: "TASK_COMPLETED",
        details: { taskId: "123", assignee: "Aneeque" },
      })
    ).resolves.not.toThrow();
  });
});
