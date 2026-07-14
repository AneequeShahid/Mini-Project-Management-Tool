"use client";
import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Eye, Ban, Zap, CheckCircle2, ToggleLeft, ToggleRight } from "lucide-react";

const ACTION_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  redact: { color: "#ef4444", icon: Ban, label: "Redact" },
  verify: { color: "#f59e0b", icon: Eye, label: "Verify" },
  halt: { color: "#ef4444", icon: AlertTriangle, label: "Halt" },
  sanitize: { color: "#8b5cf6", icon: Shield, label: "Sanitize" },
  terminate: { color: "#ef4444", icon: Zap, label: "Terminate" },
};

export default function GuardrailsPage() {
  const [guardrails, setGuardrails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/guardrails").then(r => r.json()).then(d => { setGuardrails(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setGuardrails(prev => prev.map(g => g.id === id ? { ...g, status: g.status === "active" ? "disabled" : "active" } : g));
  };

  const totalTriggers = guardrails.reduce((s, g) => s + (g.triggers_24h || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>AI Guardrails</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Safety policies that govern AI agent behavior</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", fontFamily: "monospace" }}>{totalTriggers} triggers (24h)</span>
          </div>
          <div style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", fontFamily: "monospace" }}>{guardrails.filter(g => g.status === "active").length} active</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 100, borderRadius: 14, background: "#111113", border: "1px solid #27272A" }} />
        )) : guardrails.map(g => {
          const cfg = ACTION_CONFIG[g.action] || ACTION_CONFIG.verify;
          const Icon = cfg.icon;
          return (
            <div key={g.id} style={{ borderRadius: 14, padding: "20px 24px", background: "#111113", border: `1px solid ${g.status === "active" ? cfg.color + "22" : "#1c1c1f"}`, display: "flex", alignItems: "center", gap: 20, opacity: g.status === "active" ? 1 : 0.5 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${cfg.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color={cfg.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#f5f5f5", fontFamily: "'Space Grotesk', sans-serif" }}>{g.name}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "2px 8px", borderRadius: 4, background: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
                </div>
                <p style={{ fontSize: 12, color: "#71717a" }}>{g.description}</p>
              </div>
              <div style={{ textAlign: "right", minWidth: 80 }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: g.triggers_24h > 0 ? cfg.color : "#3f3f46", fontFamily: "'Space Grotesk', sans-serif" }}>{g.triggers_24h}</p>
                <p style={{ fontSize: 9, color: "#3f3f46", textTransform: "uppercase" }}>triggers 24h</p>
              </div>
              <button onClick={() => toggle(g.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                {g.status === "active" ? <ToggleRight size={28} color="#10b981" /> : <ToggleLeft size={28} color="#3f3f46" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
