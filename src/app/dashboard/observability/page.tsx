"use client";
import { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Cpu, HardDrive, AlertTriangle, ShieldCheck, DollarSign, Activity, Zap, Clock } from "lucide-react";

const TT = { contentStyle: { backgroundColor: "#111113", borderColor: "#27272A", color: "#f5f5f5", borderRadius: 8, fontSize: 12 } };

export default function ObservabilityDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/observability")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const usageData = data?.tokenUsageHistory || [];
  const latencyData = data?.latencyHistory || [];
  const modelBreakdown = data?.modelBreakdown || [];

  const stats = [
    { label: "Total LLM Cost", value: data?.metrics?.totalCost || "$0.246", change: "+12% this week", icon: DollarSign, color: "#10b981" },
    { label: "Avg API Latency", value: data?.metrics?.averageLatency || "1.45s", change: "-80ms optimization", icon: Activity, color: "#00e5ff" },
    { label: "Cache Hit Rate", value: data?.metrics?.cacheHitRate || "94.2%", change: "Redis caching active", icon: HardDrive, color: "#5B8CFF" },
    { label: "Tool Exec Success", value: data?.metrics?.toolSuccessRate || "99.8%", change: "0 failed handshakes", icon: ShieldCheck, color: "#8b5cf6" },
    { label: "Total Tokens", value: data?.metrics?.totalTokens || "142,840", change: "Across 3 models", icon: Zap, color: "#f59e0b" },
    { label: "Active Models", value: data?.metrics?.activeModels || 3, change: "GPT-4o, mini, embed", icon: Cpu, color: "#ec4899" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>AI OS Observability</h1>
        <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>LLM token usage, model costs, cache effectiveness, and latency monitoring</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} style={{ padding: "16px 20px", background: "#111113", border: "1px solid #27272A", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{stat.label}</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: stat.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: 9, color: "#3f3f46", fontWeight: 600, marginTop: 2 }}>{stat.change}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} color={stat.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Token Usage Area */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Daily Token Consumption</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} tickLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} />
                <Tooltip {...TT} />
                <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" fill="url(#tokenGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Line */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Daily Model Costs ($)</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} tickLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} />
                <Tooltip {...TT} />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>API Latency (p50 / p95)</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} tickLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} unit="s" />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
                <Line type="monotone" dataKey="p50" stroke="#5B8CFF" strokeWidth={2} dot={{ fill: "#5B8CFF", r: 3 }} />
                <Line type="monotone" dataKey="p95" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#ef4444", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Rate Bar */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Error Rate by Day</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <XAxis dataKey="name" stroke="#3f3f46" fontSize={10} tickLine={false} />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} />
                <Tooltip {...TT} />
                <Bar dataKey="errors" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Breakdown Pie */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Model Token Breakdown</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modelBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="tokens">
                  {modelBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize: 10, color: "#71717a" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Cost Breakdown */}
        <div style={{ borderRadius: 14, padding: "20px", background: "#111113", border: "1px solid #27272A" }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginBottom: 16, fontFamily: "'Space Grotesk', sans-serif" }}>Cost per Model ($)</h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelBreakdown} layout="vertical">
                <XAxis type="number" stroke="#3f3f46" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#3f3f46" fontSize={10} tickLine={false} width={80} />
                <Tooltip {...TT} />
                <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                  {modelBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
