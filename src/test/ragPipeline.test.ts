import { describe, it, expect } from "vitest";

describe("RAG Hybrid Search Merge Logic", () => {
  it("should merge keyword results and vector results and prioritize duplicate hits", () => {
    const keywordResults = [
      { id: "1", title: "Setup auth adapters" },
      { id: "2", title: "Write documentation" }
    ];
    const vectorResults = [
      { id: "2", title: "Write documentation" },
      { id: "3", title: "Configure supabase client" }
    ];

    const seen = new Set();
    const hybridMerge: any[] = [];

    const addItems = (items: any[], weight: number) => {
      items.forEach((item) => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          hybridMerge.push({
            ...item,
            score: weight,
          });
        } else {
          const match = hybridMerge.find((x) => x.id === item.id);
          if (match) match.score += weight;
        }
      });
    };

    addItems(keywordResults, 0.6);
    addItems(vectorResults, 0.4);

    hybridMerge.sort((a, b) => b.score - a.score);

    // ID "2" appears in both arrays, so its score becomes 0.6 + 0.4 = 1.0
    expect(hybridMerge[0].id).toBe("2");
    expect(hybridMerge[0].score).toBeCloseTo(1.0);
    expect(hybridMerge[1].id).toBe("1");
    expect(hybridMerge[2].id).toBe("3");
  });
});
