"use client";
import { useState } from "react";
import { Sparkles, Layers, Target, User, CheckCircle2, GitPullRequest, RefreshCw, Code, Palette, FlaskConical, FileText, ArrowRight, Loader2 } from "lucide-react";

const TYPE_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  backend: { color: "#5B8CFF", icon: Code, label: "Backend" },
  frontend: { color: "#8b5cf6", icon: Palette, label: "Frontend" },
  testing: { color: "#10b981", icon: FlaskConical, label: "QA/Testing" },
};

export default function DecomposePage() {
  const [requirement, setRequirement] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const decompose = async () => {
    if (!requirement.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/ai/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement, projectId: projectId || "proj-1" }),
      });
      const data = await res.json();
      setResult(data.data);
    } catch { setResult(null); }
    setLoading(false);
  };

  const reset = () => { setResult(null); setRequirement(""); setProjectId(""); };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>AI Decomposition Engine</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Break down features into actionable engineering tasks</p>
        </div>
        {result && (
          <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#1e1e20", border: "1px solid #27272A", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#a1a1aa" }}>
            <RefreshCw size={12} /> Reset
          </button>
        )}
      </div>

      {!result && (
        <div style={{ borderRadius: 14, padding: "28px", background: "#111113", border: "1px solid #27272A" }}>
          <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>Feature Requirement</label>
          <textarea value={requirement} onChange={e => setRequirement(e.target.value)} placeholder="Describe a feature requirement... e.g. Implement OAuth2 Google Login for Enterprise SSO" rows={4} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 10, padding: "14px 16px", color: "#f5f5f5", fontSize: 14, outline: "none", resize: "vertical" as const, lineHeight: 1.6, boxSizing: "border-box" as const, fontFamily: "inherit" }} />
          <div style={{ marginTop: 12 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>Project ID (optional)</label>
            <input value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="proj-1" style={{ width: 200, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 12, outline: "none" }} />
          </div>
          <button onClick={decompose} disabled={loading || !requirement.trim()} style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", background: loading ? "#3f3f46" : "linear-gradient(135deg, #5B8CFF, #8b5cf6)", border: "none", borderRadius: 12, cursor: loading ? "default" : "pointer", fontSize: 14, fontWeight: 700, color: "#fff" }}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} {loading ? "Decomposing..." : "Decompose Feature"}
          </button>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center" as const, padding: 40 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid #27272A", borderTopColor: "#5B8CFF", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 13, color: "#52525b" }}>AI is analyzing and decomposing your feature...</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Overview Card */}
          <div style={{ borderRadius: 14, padding: "20px 24px", background: "#111113", border: "1px solid rgba(91,140,255,0.2)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5", marginBottom: 6 }}>{result.featureTitle}</h2>
            <p style={{ fontSize: 12, color: "#71717a", marginBottom: 16 }}>{result.summary}</p>
            <div className="flex gap-4">
              {[
                { icon: Layers, label: "Story Points", value: result.estimatedTotalStoryPoints, color: "#5B8CFF" },
                { icon: Target, label: "Priority", value: result.recommendedPriority, color: "#f59e0b" },
                { icon: User, label: "Lead", value: result.suggestedAssignee?.split(" (")[0], color: "#8b5cf6" },
              ].map((m, i) => (
                <div key={i} style={{ flex: 1, borderRadius: 10, padding: "14px 16px", background: "#09090B", border: "1px solid #1c1c1f" }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                    <m.icon size={12} color={m.color} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{m.label}</span>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div style={{ borderRadius: 14, padding: "20px 24px", background: "#111113", border: "1px solid #27272A" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} color="#10b981" /> Acceptance Criteria</h3>
            <div className="space-y-2">
              {result.acceptanceCriteria?.map((ac: string, i: number) => (
                <div key={i} className="flex items-start gap-3" style={{ padding: "8px 12px", borderRadius: 8, background: "#09090B" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#10b981", fontFamily: "monospace", minWidth: 18 }}>{i + 1}.</span>
                  <span style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.5 }}>{ac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-tasks */}
          <div>
            <h3 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 12 }}>Generated Sub-Tasks ({result.subtasks?.length})</h3>
            <div className="space-y-3">
              {result.subtasks?.map((task: any, i: number) => {
                const tc = TYPE_CONFIG[task.type] || TYPE_CONFIG.backend;
                const Icon = tc.icon;
                return (
                  <div key={i} style={{ borderRadius: 14, padding: "18px 24px", background: "#111113", border: `1px solid ${tc.color}22` }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${tc.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={16} color={tc.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5" }}>{task.title}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: `${tc.color}15`, color: tc.color }}>{tc.label}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" as const }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: tc.color }}>{task.storyPoints}<span style={{ fontSize: 10, color: "#52525b" }}> pts</span></div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#71717a", marginBottom: 8, lineHeight: 1.5 }}>{task.description}</p>
                    <div className="flex items-center gap-3" style={{ fontSize: 11, color: "#52525b", fontFamily: "monospace" }}>
                      <span className="flex items-center gap-1"><User size={10} />{task.assignee}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Target size={10} />{task.priority}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Draft ADR */}
          {result.draftADR && (
            <div style={{ borderRadius: 14, padding: "20px 24px", background: "#111113", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                <GitPullRequest size={16} color="#8b5cf6" />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f5" }}>{result.draftADR.title}</h3>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>{result.draftADR.status}</span>
              </div>
              {["context", "decision", "consequences"].map(field => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{field}</span>
                  <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 4, lineHeight: 1.5 }}>{(result.draftADR as any)[field]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
