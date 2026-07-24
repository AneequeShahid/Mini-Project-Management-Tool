"use client";
import { useState, useEffect } from "react";
import { Inbox, AlertTriangle, Sparkles, Bug, Zap, Clock, CheckCircle2, XCircle, Plus, X, Brain, Target, User, Copy, Loader2 } from "lucide-react";

const TYPE_CONFIG: Record<string, { color: string; icon: any }> = {
  bug: { color: "#ef4444", icon: Bug },
  feature: { color: "#5B8CFF", icon: Sparkles },
  performance: { color: "#f59e0b", icon: Zap },
};
const PRIORITY_COLORS: Record<string, string> = { Critical: "#ef4444", High: "#f59e0b", Medium: "#5B8CFF", Low: "#71717a" };

export default function TriagePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", source: "User Report", type: "bug" });
  const [creating, setCreating] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/triage")
      .then(r => r.json())
      .then(d => { setItems(d.items || d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const createIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true); setAiResult(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setAiResult(data);
      setItems(prev => [data, ...prev]);
    } catch {}
    setCreating(false);
  };

  const triageItem = (id: string, action: "accept" | "dismiss") => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: action === "accept" ? "triaged" : "dismissed" } : i));
  };

  const pending = items.filter(i => i.status === "pending" || i.status === "duplicate_flagged");
  const handled = items.filter(i => i.status === "triaged" || i.status === "dismissed");
  const duplicates = items.filter(i => i.status === "duplicate_flagged" || i.ai_triage?.is_duplicate);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Triage Inbox</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>AI-powered issue routing with duplicate detection</p>
        </div>
        <button onClick={() => { setShowCreate(true); setAiResult(null); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#5B8CFF", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#000" }}>
          <Plus size={13} /> New Issue
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3">
        {[
          { label: "Total", value: items.length, color: "#5B8CFF" },
          { label: "Pending", value: pending.length, color: "#f59e0b" },
          { label: "Duplicates", value: duplicates.length, color: "#ef4444" },
          { label: "Triaged", value: handled.length, color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, borderRadius: 10, padding: "14px 16px", background: "#111113", border: "1px solid #27272A" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 18, padding: 28, width: 500, maxHeight: "80vh", overflow: "auto" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5" }}>Submit Issue for AI Triage</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} color="#52525b" /></button>
            </div>
            <form onSubmit={createIssue} className="space-y-4">
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Title</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Bug: Auth token expires too early" required style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "10px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Detailed description..." rows={3} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "10px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", resize: "vertical" as const, boxSizing: "border-box" as const }} />
              </div>
              <div className="flex gap-3">
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Source</label>
                  <select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 12, outline: "none" }}>
                    {["GitHub Issue", "Customer Request", "Internal QA", "User Report"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 12, outline: "none" }}>
                    {["bug", "feature", "performance"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={creating} style={{ width: "100%", padding: "11px", background: creating ? "#3f3f46" : "linear-gradient(135deg, #5B8CFF, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: creating ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />} {creating ? "Analyzing..." : "Submit for AI Triage"}
              </button>
            </form>

            {aiResult && aiResult.ai_triage && (
              <div style={{ marginTop: 20, borderRadius: 12, padding: "16px 20px", background: "#09090B", border: `1px solid ${aiResult.ai_triage.is_duplicate ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}` }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                  <Brain size={14} color="#8b5cf6" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#f5f5f5" }}>AI Triage Analysis</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 11, color: "#52525b" }}>Duplicate Detected</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: aiResult.ai_triage.is_duplicate ? "#ef4444" : "#10b981" }}>{aiResult.ai_triage.is_duplicate ? "Yes" : "No"}</span>
                  </div>
                  {aiResult.ai_triage.is_duplicate && (
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 11, color: "#52525b" }}>Similarity</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", fontFamily: "monospace" }}>{(aiResult.ai_triage.similarity_score * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  {aiResult.ai_triage.matched_item && (
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 11, color: "#52525b" }}>Matches</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}>{aiResult.ai_triage.matched_item.title?.slice(0, 40)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 11, color: "#52525b" }}>Suggested Priority</span>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: `${PRIORITY_COLORS[aiResult.ai_triage.suggested_priority] || "#5B8CFF"}15`, color: PRIORITY_COLORS[aiResult.ai_triage.suggested_priority] || "#5B8CFF" }}>{aiResult.ai_triage.suggested_priority}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 11, color: "#52525b" }}>Suggested Assignee</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#8b5cf6" }}>{aiResult.ai_triage.suggested_assignee}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Items */}
      {pending.length > 0 && (
        <div>
          <h2 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 12 }}>Needs Triage ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map(item => {
              const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.feature;
              const Icon = tc.icon;
              const isDup = item.status === "duplicate_flagged" || item.ai_triage?.is_duplicate;
              return (
                <div key={item.id} style={{ borderRadius: 14, padding: "18px 24px", background: "#111113", border: `1px solid ${isDup ? "rgba(239,68,68,0.2)" : tc.color + "22"}`, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${tc.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={tc.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5" }}>{item.title}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: `${PRIORITY_COLORS[item.priority]}15`, color: PRIORITY_COLORS[item.priority] }}>{item.priority}</span>
                      {isDup && <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, padding: "2px 7px", borderRadius: 4, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>⚠ Duplicate</span>}
                    </div>
                    <div className="flex items-center gap-3" style={{ fontSize: 11, color: "#52525b", fontFamily: "monospace" }}>
                      <span className="flex items-center gap-1"><Inbox size={10} />{item.source}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{new Date(item.created_at).toLocaleDateString()}</span>
                      {item.assignee && <><span>·</span><span className="flex items-center gap-1"><User size={10} />{item.assignee}</span></>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => triageItem(item.id, "accept")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#10b981" }}>
                      <CheckCircle2 size={12} /> Accept
                    </button>
                    <button onClick={() => triageItem(item.id, "dismiss")} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#ef4444" }}>
                      <XCircle size={12} /> Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Handled */}
      {handled.length > 0 && (
        <div>
          <h2 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 12 }}>Handled ({handled.length})</h2>
          <div className="space-y-2">
            {handled.map(item => (
              <div key={item.id} style={{ borderRadius: 10, padding: "12px 20px", background: "#09090B", border: "1px solid #1c1c1f", display: "flex", alignItems: "center", gap: 12, opacity: 0.6 }}>
                {item.status === "triaged" ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                <span style={{ fontSize: 13, color: "#71717a", flex: 1 }}>{item.title}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, color: item.status === "triaged" ? "#10b981" : "#ef4444" }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
