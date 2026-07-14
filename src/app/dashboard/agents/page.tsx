"use client";
import { useState, useEffect } from "react";
import { Cpu, Activity, CheckCircle2, Clock, Zap, BarChart3, RefreshCw } from "lucide-react";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/agents")
      .then(r => r.json())
      .then(d => { setAgents(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>AI Agents</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Autonomous agents running across your engineering stack</p>
        </div>
        <div className="flex gap-2">
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#111113", border: "1px solid #27272A", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}>
            <RefreshCw size={13} /> Sync
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Active Agents", value: agents.filter(a => a.status !== "idle").length || 5, color: "#10b981" },
          { label: "Tasks Completed", value: agents.reduce((s, a) => s + (a.tasks_completed || 0), 0) || 271, color: "#5B8CFF" },
          { label: "Tokens Used", value: `${((agents.reduce((s, a) => s + (a.tokens_used || 0), 0) || 49920) / 1000).toFixed(1)}K`, color: "#8b5cf6" },
          { label: "Avg Uptime", value: "99.1%", color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ borderRadius: 12, padding: "16px 20px", background: "#111113", border: "1px solid #27272A" }}>
            <p style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      <div className="space-y-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 120, borderRadius: 14, background: "#111113", border: "1px solid #27272A" }} />
        )) : agents.map(agent => (
          <div key={agent.id} style={{ borderRadius: 14, padding: "20px 24px", background: "#111113", border: `1px solid ${agent.color}22`, display: "flex", alignItems: "center", gap: 20 }}>
            {/* Avatar */}
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${agent.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16, fontWeight: 800, color: agent.color, fontFamily: "'Space Grotesk', sans-serif" }}>
              {agent.avatar}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 15, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Space Grotesk', sans-serif" }}>{agent.name}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, background: `${agent.color}15`, color: agent.color }}>
                  {agent.status}
                </span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#3f3f46" }}>{agent.model}</span>
              </div>
              <p style={{ fontSize: 12, color: "#71717a", marginBottom: 8 }}>{agent.task}</p>

              {/* Progress bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: "#1e1e20", overflow: "hidden" }}>
                  <div style={{ width: `${agent.progress}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${agent.color}, ${agent.color}88)`, transition: "width 1s ease" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: agent.color, fontFamily: "monospace", minWidth: 36 }}>{agent.progress}%</span>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
              {[
                { label: "Tasks", value: agent.tasks_completed, icon: CheckCircle2 },
                { label: "Tokens", value: `${(agent.tokens_used / 1000).toFixed(1)}K`, icon: Zap },
                { label: "Uptime", value: agent.uptime, icon: Activity },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.label} style={{ textAlign: "center" }}>
                    <Icon size={12} color="#3f3f46" style={{ margin: "0 auto 4px" }} />
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f5", fontFamily: "monospace" }}>{m.value}</p>
                    <p style={{ fontSize: 9, color: "#3f3f46", textTransform: "uppercase" }}>{m.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
