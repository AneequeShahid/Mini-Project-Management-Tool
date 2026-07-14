"use client";
import { useState, useEffect } from "react";
import { Webhook, Plus, CheckCircle2, PauseCircle, Trash2, Copy, ExternalLink, RefreshCw } from "lucide-react";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", events: "" });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/webhooks").then(r => r.json()).then(d => { setWebhooks(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/webhooks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, events: form.events.split(",").map(e => e.trim()) }) });
    if (res.ok) { const wh = await res.json(); setWebhooks(prev => [wh, ...prev]); setShowCreate(false); setForm({ name: "", url: "", events: "" }); }
  };

  const togglePause = (id: string) => {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w));
  };

  const remove = (id: string) => setWebhooks(prev => prev.filter(w => w.id !== id));

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Webhooks</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Outgoing event hooks for external services</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#5B8CFF", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#000" }}>
          <Plus size={13} /> Add Webhook
        </button>
      </div>

      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 18, padding: 28, width: 440 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5", marginBottom: 20 }}>Add Webhook</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: "Name", key: "name", placeholder: "Slack Notification Hook" },
                { label: "Endpoint URL", key: "url", placeholder: "https://hooks.example.com/..." },
                { label: "Events (comma-separated)", key: "events", placeholder: "task.created, sprint.completed" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</label>
                  <input type="text" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} required style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "9px", background: "#1e1e20", border: "1px solid #27272A", borderRadius: 10, color: "#a1a1aa", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "9px", background: "#5B8CFF", border: "none", borderRadius: 10, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {webhooks.map(wh => (
          <div key={wh.id} style={{ borderRadius: 14, padding: "18px 24px", background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: wh.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Webhook size={18} color={wh.status === "active" ? "#10b981" : "#f59e0b"} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5" }}>{wh.name}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: wh.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: wh.status === "active" ? "#10b981" : "#f59e0b" }}>{wh.status}</span>
              </div>
              <p style={{ fontSize: 11, color: "#52525b", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{wh.url}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(wh.events || []).map((ev: string) => (
                  <span key={ev} style={{ fontSize: 9, fontFamily: "monospace", background: "#1e1e20", color: "#71717a", padding: "2px 6px", borderRadius: 4 }}>{ev}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 10, color: "#3f3f46", fontFamily: "monospace" }}>Last: {wh.last_triggered}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => copyUrl(wh.id, wh.url)} title="Copy URL" style={{ width: 30, height: 30, borderRadius: 6, background: "#1e1e20", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                {copied === wh.id ? <CheckCircle2 size={12} color="#10b981" /> : <Copy size={12} color="#71717a" />}
              </button>
              <button onClick={() => togglePause(wh.id)} title="Toggle" style={{ width: 30, height: 30, borderRadius: 6, background: "#1e1e20", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <PauseCircle size={12} color="#f59e0b" />
              </button>
              <button onClick={() => remove(wh.id)} title="Delete" style={{ width: 30, height: 30, borderRadius: 6, background: "#1e1e20", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Trash2 size={12} color="#ef4444" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
