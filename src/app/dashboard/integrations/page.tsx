"use client";
import { useState, useEffect } from "react";
import { Link2, Unlink, RefreshCw, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { INTEGRATIONS } from "@/lib/data";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [filter, setFilter] = useState("all");

  const categories = [...new Set(integrations.map(i => i.category))];
  const filtered = filter === "all" ? integrations : integrations.filter(i => i.category === filter);
  const connectedCount = integrations.filter(i => i.connected).length;

  const toggleConnection = async (id: string) => {
    setIntegrations(prev => prev.map(i => {
      if (i.id !== id) return i;
      const nowConnected = !i.connected;
      return { ...i, connected: nowConnected, status: nowConnected ? "active" : "disconnected", last_sync: nowConnected ? "just now" : null };
    }));
    // Fire PUT to persist
    const target = integrations.find(i => i.id === id);
    if (target) {
      await fetch(`/api/integrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connected: !target.connected })
      }).catch(() => {});
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Integrations</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>{connectedCount} of {integrations.length} connected</p>
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", borderColor: filter === "all" ? "#5B8CFF" : "#27272A", background: filter === "all" ? "rgba(91,140,255,0.1)" : "#111113", color: filter === "all" ? "#5B8CFF" : "#a1a1aa" }}>All</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", borderColor: filter === cat ? "#5B8CFF" : "#27272A", background: filter === cat ? "rgba(91,140,255,0.1)" : "#111113", color: filter === cat ? "#5B8CFF" : "#a1a1aa" }}>{cat}</button>
        ))}
      </div>

      {/* Integration grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map(integ => (
          <div key={integ.id} style={{ borderRadius: 14, padding: "20px", background: "#111113", border: `1px solid ${integ.connected ? "#27272A" : "#1c1c1f"}`, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${integ.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: integ.color === "#000" ? "#a1a1aa" : integ.color }}>
                  {integ.name.charAt(0)}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f5" }}>{integ.name}</p>
                  <p style={{ fontSize: 10, color: "#3f3f46", textTransform: "uppercase", fontFamily: "monospace" }}>{integ.category}</p>
                </div>
              </div>
              {integ.connected ? (
                <CheckCircle2 size={16} color="#10b981" />
              ) : (
                <AlertCircle size={16} color="#3f3f46" />
              )}
            </div>
            <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5 }}>{integ.description}</p>
            <div className="flex items-center justify-between" style={{ marginTop: "auto" }}>
              {integ.last_sync && (
                <span className="flex items-center gap-1" style={{ fontSize: 10, color: "#3f3f46", fontFamily: "monospace" }}>
                  <RefreshCw size={9} /> {integ.last_sync}
                </span>
              )}
              {!integ.last_sync && <span />}
              <button
                onClick={() => toggleConnection(integ.id)}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, border: "1px solid",
                  background: integ.connected ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
                  borderColor: integ.connected ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)",
                  color: integ.connected ? "#ef4444" : "#10b981" }}
              >
                {integ.connected ? <><Unlink size={11} /> Disconnect</> : <><Link2 size={11} /> Connect</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
