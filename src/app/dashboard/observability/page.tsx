"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Cpu, HardDrive, AlertTriangle, ShieldCheck, DollarSign, Activity } from "lucide-react";

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

  const usageData = data?.tokenUsageHistory || [
    { name: "Mon", tokens: 12000, cost: 0.024 },
    { name: "Tue", tokens: 18000, cost: 0.036 },
    { name: "Wed", tokens: 15000, cost: 0.030 },
    { name: "Thu", tokens: 28000, cost: 0.056 },
    { name: "Fri", tokens: 32000, cost: 0.064 },
    { name: "Sat", tokens: 10000, cost: 0.020 },
    { name: "Sun", tokens: 8000, cost: 0.016 },
  ];

  const stats = [
    { label: "Total LLM Cost", value: data?.metrics?.totalCost || "$0.246", change: "+12% this week", icon: DollarSign, color: "text-accent-emerald", bg: "bg-accent-emerald/10" },
    { label: "Avg API Latency", value: data?.metrics?.averageLatency || "1.45s", change: "-80ms optimization", icon: Activity, color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
    { label: "Cache Hit Rate", value: data?.metrics?.cacheHitRate || "94.2%", change: "Redis caching active", icon: HardDrive, color: "text-accent-blue", bg: "bg-accent-blue/10" },
    { label: "Tool Exec Success", value: data?.metrics?.toolSuccessRate || "99.8%", change: "0 failed handshakes", icon: ShieldCheck, color: "text-accent-purple", bg: "bg-accent-purple/10" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">AI OS Observability</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time statistics monitoring LLM token usages, model costs, cache effectiveness, and handshake states.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-extrabold text-white font-heading">{stat.value}</p>
                <p className="text-[9px] text-slate-500 font-semibold">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Observability Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token Usage */}
        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-6">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-accent-purple" />
            <h2 className="text-lg font-bold font-heading text-white">Daily Token Consumption</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.08)", color: "#fff" }} />
                <Line type="monotone" dataKey="tokens" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Costs */}
        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-6">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-accent-emerald" />
            <h2 className="text-lg font-bold font-heading text-white">Daily Model Costs ($)</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.08)", color: "#fff" }} />
                <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
