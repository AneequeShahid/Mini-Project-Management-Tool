"use client";
import { useState, useEffect } from "react";
import { Rocket, CheckCircle2, XCircle, Clock, RefreshCw, ExternalLink, GitBranch, User, Zap } from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  success: { color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Success", icon: CheckCircle2 },
  failed: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Failed", icon: XCircle },
  building: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Building", icon: RefreshCw },
};

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/deployments")
      .then(r => r.json())
      .then(d => { setDeployments(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? deployments : deployments.filter(d => d.status === filter);
  const stats = {
    success: deployments.filter(d => d.status === "success").length,
    failed: deployments.filter(d => d.status === "failed").length,
    building: deployments.filter(d => d.status === "building").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>
            Deployments
          </h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>CI/CD pipeline status across all projects</p>
        </div>
        <button
          onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#111113", border: "1px solid #27272A", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Successful", value: stats.success, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
          { label: "Failed", value: stats.failed, color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
          { label: "Building", value: stats.building, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
        ].map(s => (
          <div key={s.label} style={{ borderRadius: 12, padding: "16px 20px", background: s.bg, border: `1px solid ${s.color}22` }}>
            <p style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {["all", "success", "failed", "building"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
              borderColor: filter === f ? "#5B8CFF" : "#27272A",
              background: filter === f ? "rgba(91,140,255,0.1)" : "#111113",
              color: filter === f ? "#5B8CFF" : "#a1a1aa" }}
          >{f === "all" ? "All Deployments" : f}</button>
        ))}
      </div>

      {/* Deployment list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 12 }} />
          ))
        ) : filtered.map(dep => {
          const cfg = STATUS_CONFIG[dep.status] || STATUS_CONFIG.building;
          const Icon = cfg.icon;
          return (
            <div key={dep.id} style={{ borderRadius: 12, padding: "16px 20px", background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={cfg.color} style={dep.status === "building" ? { animation: "spin 1s linear infinite" } : undefined} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}>{dep.message}</span>
                  <span style={{ fontSize: 9, fontFamily: "monospace", background: cfg.bg, color: cfg.color, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", fontWeight: 700 }}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-4" style={{ fontSize: 11, color: "#52525b", fontFamily: "monospace" }}>
                  <span className="flex items-center gap-1"><GitBranch size={10} />{dep.project}/{dep.branch}</span>
                  <span style={{ color: "#3f3f46" }}>·</span>
                  <span style={{ color: "#5B8CFF" }}>{dep.commit}</span>
                  <span style={{ color: "#3f3f46" }}>·</span>
                  <span className="flex items-center gap-1"><User size={10} />{dep.triggered_by}</span>
                  <span style={{ color: "#3f3f46" }}>·</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{dep.duration}</span>
                  <span style={{ color: "#3f3f46" }}>·</span>
                  <span style={{ padding: "1px 6px", borderRadius: 4, background: "#1e1e20", color: "#a1a1aa", fontSize: 9, textTransform: "uppercase" }}>{dep.environment}</span>
                </div>
              </div>
              <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: "#52525b", fontFamily: "monospace" }}>{new Date(dep.created_at).toLocaleString()}</span>
                {dep.url && (
                  <a href={dep.url} target="_blank" rel="noreferrer" style={{ width: 28, height: 28, borderRadius: 6, background: "#1e1e20", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ExternalLink size={11} color="#a1a1aa" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
