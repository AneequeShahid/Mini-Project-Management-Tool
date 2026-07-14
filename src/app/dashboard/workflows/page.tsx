"use client";
import { useState, useEffect } from "react";
import { Workflow, Plus, Play, Pause, Trash2, Clock, Zap, ToggleLeft, ToggleRight } from "lucide-react";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", trigger: "", action: "" });

  useEffect(() => {
    fetch("/api/workflows").then(r => r.json()).then(d => { setWorkflows(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggle = (id: string) => setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w));
  const remove = (id: string) => setWorkflows(prev => prev.filter(w => w.id !== id));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/workflows", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { const wf = await res.json(); setWorkflows(prev => [wf, ...prev]); setShowCreate(false); setForm({ name: "", trigger: "", action: "" }); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Workflows</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Trigger-action automation rules</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#8b5cf6", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff" }}>
          <Plus size={13} /> New Workflow
        </button>
      </div>

      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 18, padding: 28, width: 440 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5", marginBottom: 20 }}>Create Workflow</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: "Name", key: "name", placeholder: "Auto-label PRs by file path" },
                { label: "When (Trigger)", key: "trigger", placeholder: "PR opened in src/auth/*" },
                { label: "Then (Action)", key: "action", placeholder: "Add label 'auth' + assign reviewer" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</label>
                  <input type="text" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} required style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
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

      <div className="space-y-3">
        {workflows.map(w => (
          <div key={w.id} style={{ borderRadius: 14, padding: "18px 24px", background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", gap: 16, opacity: w.status === "active" ? 1 : 0.5 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: w.status === "active" ? "rgba(139,92,246,0.1)" : "rgba(63,63,70,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Workflow size={18} color={w.status === "active" ? "#8b5cf6" : "#3f3f46"} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5", marginBottom: 4 }}>{w.name}</p>
              <p style={{ fontSize: 11, color: "#52525b" }}><span style={{ color: "#5B8CFF" }}>WHEN</span> {w.trigger} <span style={{ color: "#3f3f46" }}>→</span> <span style={{ color: "#8b5cf6" }}>THEN</span> {w.action}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f5", fontFamily: "monospace" }}>{w.runs}</p>
              <p style={{ fontSize: 9, color: "#3f3f46" }}>runs · {w.last_run}</p>
            </div>
            <button onClick={() => toggle(w.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {w.status === "active" ? <ToggleRight size={24} color="#10b981" /> : <ToggleLeft size={24} color="#3f3f46" />}
            </button>
            <button onClick={() => remove(w.id)} style={{ width: 30, height: 30, borderRadius: 6, background: "#1e1e20", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Trash2 size={12} color="#ef4444" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
