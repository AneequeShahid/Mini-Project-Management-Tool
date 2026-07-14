"use client";
import { useState, useEffect } from "react";
import { FileText, Plus, CheckCircle2, Clock, User, ChevronDown, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  accepted: { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  proposed: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  deprecated: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  superseded: { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
};

export default function ADRPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", context: "", decision: "", consequences: "", status: "proposed", author: "AS" });

  useEffect(() => {
    fetch("/api/adr").then(r => r.json()).then(d => { setRecords(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/adr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { const r = await res.json(); setRecords(prev => [r, ...prev]); setShowCreate(false); setForm({ title: "", context: "", decision: "", consequences: "", status: "proposed", author: "AS" }); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Architecture Decision Records</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>{records.length} decisions documented</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#5B8CFF", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#000" }}>
          <Plus size={13} /> New ADR
        </button>
      </div>

      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 18, padding: 28, width: 480, maxHeight: "80vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5", marginBottom: 20 }}>New Decision Record</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: "Title", key: "title", type: "input", placeholder: "Use X over Y for Z" },
                { label: "Context", key: "context", type: "textarea", placeholder: "Why is this decision needed?" },
                { label: "Decision", key: "decision", type: "textarea", placeholder: "What was decided?" },
                { label: "Consequences", key: "consequences", type: "textarea", placeholder: "What are the implications?" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</label>
                  {f.type === "input" ? (
                    <input type="text" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} required style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  ) : (
                    <textarea value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} required rows={3} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "9px", background: "#1e1e20", border: "1px solid #27272A", borderRadius: 10, color: "#a1a1aa", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "9px", background: "#5B8CFF", border: "none", borderRadius: 10, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Record Decision</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {records.map(r => {
          const sc = STATUS_COLORS[r.status] || STATUS_COLORS.accepted;
          const isExpanded = expanded === r.id;
          return (
            <div key={r.id} style={{ borderRadius: 14, background: "#111113", border: "1px solid #27272A", overflow: "hidden" }}>
              <button onClick={() => setExpanded(isExpanded ? null : r.id)} style={{ width: "100%", padding: "18px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, textAlign: "left" }}>
                {isExpanded ? <ChevronDown size={14} color="#52525b" /> : <ChevronRight size={14} color="#52525b" />}
                <span style={{ fontSize: 12, fontWeight: 800, color: "#3f3f46", fontFamily: "monospace", minWidth: 70 }}>{r.number}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5", flex: 1 }}>{r.title}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, background: sc.bg, color: sc.color }}>{r.status}</span>
                <span style={{ fontSize: 10, color: "#3f3f46", fontFamily: "monospace" }}>{r.date}</span>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "#1e1e20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#71717a" }}>{r.author}</div>
              </button>
              {isExpanded && (
                <div style={{ padding: "0 24px 20px 54px", borderTop: "1px solid #1c1c1f" }}>
                  {[
                    { label: "Context", value: r.context, color: "#5B8CFF" },
                    { label: "Decision", value: r.decision, color: "#10b981" },
                    { label: "Consequences", value: r.consequences, color: "#f59e0b" },
                  ].map(s => (
                    <div key={s.label} style={{ marginTop: 14 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: s.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{s.label}</p>
                      <p style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.6 }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
