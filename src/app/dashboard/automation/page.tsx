"use client";
import { useState, useEffect } from "react";
import { Shield, Zap, AlertTriangle, CheckCircle2, XCircle, Plus, ToggleLeft, ToggleRight, Play } from "lucide-react";

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", trigger: "", action: "" });

  useEffect(() => {
    fetch("/api/automation")
      .then(r => r.json())
      .then(d => { setWorkflows(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w));
  };

  const runWorkflow = (id: string) => {
    setRunningId(id);
    setTimeout(() => {
      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, runs: w.runs + 1, last_run: "just now" } : w));
      setRunningId(null);
    }, 1500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/automation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      const wf = await res.json();
      setWorkflows(prev => [wf, ...prev]);
      setShowCreate(false);
      setForm({ name: "", trigger: "", action: "" });
    }
  };

  const active = workflows.filter(w => w.status === "active").length;
  const totalRuns = workflows.reduce((s, w) => s + (w.runs || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Automation</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Event-driven workflows that run on your stack</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#8b5cf6", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff" }}>
          <Plus size={13} /> New Workflow
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Active Workflows", value: active, color: "#10b981" },
          { label: "Total Runs", value: totalRuns, color: "#5B8CFF" },
          { label: "Paused", value: workflows.length - active, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ borderRadius: 12, padding: "16px 20px", background: "#111113", border: "1px solid #27272A" }}>
            <p style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 18, padding: 28, width: 440 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5", marginBottom: 20 }}>Create Workflow</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: "Workflow Name", key: "name", placeholder: "Auto-assign Critical Bugs" },
                { label: "Trigger Condition", key: "trigger", placeholder: "Task created with priority=Critical" },
                { label: "Action", key: "action", placeholder: "Assign to lead + notify Slack" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</label>
                  <input
                    type="text"
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    required
                    style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "9px", background: "#1e1e20", border: "1px solid #27272A", borderRadius: 10, color: "#a1a1aa", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "9px", background: "#8b5cf6", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workflow list */}
      <div className="space-y-3">
        {loading ? Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />
        )) : workflows.map(w => (
          <div key={w.id} style={{ borderRadius: 12, padding: "18px 20px", background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: w.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap size={18} color={w.status === "active" ? "#10b981" : "#f59e0b"} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5" }}>{w.name}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", background: w.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: w.status === "active" ? "#10b981" : "#f59e0b", padding: "2px 7px", borderRadius: 4 }}>{w.status}</span>
              </div>
              <p style={{ fontSize: 11, color: "#52525b", marginBottom: 2 }}>
                <span style={{ color: "#5B8CFF" }}>WHEN</span> {w.trigger}
              </p>
              <p style={{ fontSize: 11, color: "#52525b" }}>
                <span style={{ color: "#8b5cf6" }}>THEN</span> {w.action}
              </p>
            </div>
            <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#f5f5f5", fontFamily: "monospace" }}>{w.runs} runs</p>
                <p style={{ fontSize: 10, color: "#52525b" }}>Last: {w.last_run}</p>
              </div>
              <button
                onClick={() => runWorkflow(w.id)}
                disabled={runningId === w.id}
                style={{ width: 32, height: 32, borderRadius: 8, background: "#1e1e20", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Play size={12} color="#a1a1aa" style={runningId === w.id ? { animation: "pulse 0.5s infinite" } : undefined} />
              </button>
              <button onClick={() => toggleWorkflow(w.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                {w.status === "active"
                  ? <ToggleRight size={24} color="#10b981" />
                  : <ToggleLeft size={24} color="#3f3f46" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
