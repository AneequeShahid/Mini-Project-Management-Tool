"use client";
import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Trophy, TrendingUp, GitPullRequest, Bug, Clock, Zap } from "lucide-react";

const CHART_TOOLTIP = { contentStyle: { backgroundColor: "#111113", borderColor: "#27272A", color: "#f5f5f5", borderRadius: 8, fontSize: 12 } };

export default function WrappedPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/wrapped")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const velocity = data?.velocity || [];
  const contributors = data?.top_contributors || [];
  const deliveryRate = data?.delivery_rate || 91;
  const bugsResolved = data?.bugs_resolved || 14;
  const avgCycleTime = data?.avg_cycle_time_days || 2.4;
  const totalPRs = data?.total_prs_merged || 75;

  const pieData = [
    { name: "Features", value: 42, color: "#5B8CFF" },
    { name: "Bugs", value: 14, color: "#ef4444" },
    { name: "Design", value: 12, color: "#8b5cf6" },
    { name: "Docs", value: 7, color: "#10b981" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Project Wrapped</h1>
        <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Sprint analytics and team performance overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Delivery Rate", value: `${deliveryRate}%`, color: "#10b981", icon: TrendingUp },
          { label: "PRs Merged", value: totalPRs, color: "#5B8CFF", icon: GitPullRequest },
          { label: "Bugs Resolved", value: bugsResolved, color: "#ef4444", icon: Bug },
          { label: "Avg Cycle Time", value: `${avgCycleTime}d`, color: "#f59e0b", icon: Clock },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ borderRadius: 12, padding: "16px 20px", background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{s.value}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={s.color} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Velocity Chart */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Sprint Velocity Trend</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocity}>
                <defs>
                  <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5B8CFF" stopOpacity={0.3}/><stop offset="95%" stopColor="#5B8CFF" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gradDelivered" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="sprint" stroke="#3f3f46" fontSize={10} tickLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Area type="monotone" dataKey="planned" stroke="#5B8CFF" fill="url(#gradPlanned)" strokeWidth={2} />
                <Area type="monotone" dataKey="delivered" stroke="#10b981" fill="url(#gradDelivered)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delivery Breakdown Pie */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Delivery Breakdown</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bug Resolution Bar */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Bugs per Sprint</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocity}>
                <XAxis dataKey="sprint" stroke="#3f3f46" fontSize={10} tickLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="bugs" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Contributors */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>
            <Trophy size={14} color="#f59e0b" style={{ display: "inline", marginRight: 6 }} />
            Top Contributors
          </h3>
          <div className="space-y-3">
            {contributors.map((c: any, i: number) => {
              const colors = ["#f59e0b", "#a1a1aa", "#b87333", "#5B8CFF", "#8b5cf6"];
              return (
                <div key={c.avatar} className="flex items-center gap-3" style={{ padding: "8px 12px", borderRadius: 10, background: i === 0 ? "rgba(245,158,11,0.06)" : "transparent", border: i === 0 ? "1px solid rgba(245,158,11,0.15)" : "1px solid transparent" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: colors[i], width: 18, fontFamily: "monospace" }}>#{i + 1}</span>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${colors[i]}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: colors[i] }}>{c.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}>{c.name}</p>
                    <p style={{ fontSize: 10, color: "#3f3f46", fontFamily: "monospace" }}>{c.tasks} tasks · {c.points} pts · {c.prs} PRs</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
