"use client";
import { useState, useEffect } from "react";
import { GitPullRequest, Database, AlertTriangle, Rocket, Cpu, Shield, Target, Brain, Clock } from "lucide-react";

const TYPE_ICONS: Record<string, any> = { pr: GitPullRequest, db: Database, risk: AlertTriangle, deploy: Rocket, agent: Cpu, security: Shield, sprint: Target, memory: Brain };

export default function TimelinePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/ai/timeline").then(r => r.json()).then(d => { setEvents(d?.events || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const types = [...new Set(events.map(e => e.type))];
  const filtered = filter === "all" ? events : events.filter(e => e.type === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Engineering Timeline</h1>
        <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Chronological feed of all engineering activity</p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", borderColor: filter === "all" ? "#5B8CFF" : "#27272A", background: filter === "all" ? "rgba(91,140,255,0.1)" : "#111113", color: filter === "all" ? "#5B8CFF" : "#a1a1aa" }}>All</button>
        {types.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", borderColor: filter === t ? "#5B8CFF" : "#27272A", background: filter === t ? "rgba(91,140,255,0.1)" : "#111113", color: filter === t ? "#5B8CFF" : "#a1a1aa" }}>{t}</button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 32 }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: "linear-gradient(180deg, #27272A, transparent)" }} />

        <div className="space-y-4">
          {filtered.map((event, idx) => {
            const Icon = TYPE_ICONS[event.type] || Clock;
            return (
              <div key={event.id} style={{ position: "relative" }}>
                {/* Dot */}
                <div style={{ position: "absolute", left: -24, top: 18, width: 14, height: 14, borderRadius: "50%", background: "#09090B", border: `2px solid ${event.color}`, zIndex: 1 }} />
                {/* Card */}
                <div style={{ borderRadius: 12, padding: "16px 20px", background: "#111113", border: `1px solid ${event.color}18`, marginLeft: 8 }}>
                  <div className="flex items-start gap-3">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${event.color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={16} color={event.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5" }}>{event.title}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: `${event.color}15`, color: event.color }}>{event.type}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5 }}>{event.description}</p>
                      <div className="flex items-center gap-3 mt-2" style={{ fontSize: 10, color: "#3f3f46", fontFamily: "monospace" }}>
                        <span className="flex items-center gap-1"><Clock size={9} />{event.time}</span>
                        <span>·</span>
                        <span>{event.project}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
