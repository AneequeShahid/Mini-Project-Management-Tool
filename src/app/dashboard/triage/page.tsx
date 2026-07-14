"use client";
import { useState, useEffect } from "react";
import { Inbox, AlertTriangle, Sparkles, Bug, Zap, TrendingUp, User, Clock, ArrowRight, CheckCircle2, XCircle } from "lucide-react";

const TYPE_CONFIG: Record<string, { color: string; icon: any }> = {
  bug: { color: "#ef4444", icon: Bug },
  feature: { color: "#5B8CFF", icon: Sparkles },
  performance: { color: "#f59e0b", icon: Zap },
};
const PRIORITY_COLORS: Record<string, string> = { Critical: "#ef4444", High: "#f59e0b", Medium: "#5B8CFF", Low: "#71717a" };

export default function TriagePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/triage").then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const triageItem = (id: string, action: "accept" | "dismiss") => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: action === "accept" ? "triaged" : "dismissed" } : i));
  };

  const pending = items.filter(i => i.status === "pending");
  const handled = items.filter(i => i.status !== "pending");

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Triage Inbox</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Review and route incoming issues from all sources</p>
        </div>
        <div style={{ padding: "6px 14px", borderRadius: 8, background: pending.length > 0 ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)", border: `1px solid ${pending.length > 0 ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)"}` }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: pending.length > 0 ? "#f59e0b" : "#10b981", fontFamily: "monospace" }}>{pending.length} pending</span>
        </div>
      </div>

      {pending.length > 0 && (
        <div>
          <h2 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Needs Triage ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map(item => {
              const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.feature;
              const Icon = tc.icon;
              return (
                <div key={item.id} style={{ borderRadius: 14, padding: "18px 24px", background: "#111113", border: `1px solid ${tc.color}22`, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: `${tc.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={tc.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5" }}>{item.title}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: `${PRIORITY_COLORS[item.priority]}15`, color: PRIORITY_COLORS[item.priority] }}>{item.priority}</span>
                    </div>
                    <div className="flex items-center gap-3" style={{ fontSize: 11, color: "#52525b", fontFamily: "monospace" }}>
                      <span className="flex items-center gap-1"><Inbox size={10} />{item.source}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{new Date(item.created_at).toLocaleDateString()}</span>
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

      {handled.length > 0 && (
        <div>
          <h2 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Handled ({handled.length})</h2>
          <div className="space-y-2">
            {handled.map(item => (
              <div key={item.id} style={{ borderRadius: 10, padding: "12px 20px", background: "#09090B", border: "1px solid #1c1c1f", display: "flex", alignItems: "center", gap: 12, opacity: 0.6 }}>
                {item.status === "triaged" ? <CheckCircle2 size={14} color="#10b981" /> : <XCircle size={14} color="#ef4444" />}
                <span style={{ fontSize: 13, color: "#71717a", flex: 1 }}>{item.title}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", color: item.status === "triaged" ? "#10b981" : "#ef4444" }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
