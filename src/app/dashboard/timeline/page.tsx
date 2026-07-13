"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Sparkles, Calendar, Zap, AlertTriangle, Users, BarChart2 } from "lucide-react";

export default function PersonalTimelinePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/timeline")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Personal AI Timeline</h1>
        <p className="text-slate-400 text-sm mt-1">A detailed historical analysis of your contributions, decisions, risks, and productivity trends.</p>
      </div>

      {/* AI Narrative Card */}
      <div className="p-6 bg-white/[0.03] border border-accent-purple/20 rounded-[24px] backdrop-blur-[24px] bg-gradient-to-r from-accent-purple/10 to-accent-blue/5 flex gap-4 items-start">
        <div className="p-3 rounded-2xl bg-accent-purple/20 text-accent-purple shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="text-sm font-bold font-heading text-slate-300 uppercase tracking-wider">Timeline Intelligence Summary</h2>
          <p className="text-slate-200 mt-2 leading-relaxed font-heading font-medium text-lg">
            "{data?.summary}"
          </p>
        </div>
      </div>

      {/* Main Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Accomplishments Feed */}
        <div className="lg:col-span-2 p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-6">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-accent-cyan" />
            <h2 className="text-lg font-bold font-heading text-white">This Week's Accomplishments</h2>
          </div>
          <div className="space-y-4">
            {data?.accomplishments?.map((acc: any) => (
              <div key={acc.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 font-mono">{acc.date}</p>
                  <p className="text-sm font-bold text-white leading-normal">{acc.text}</p>
                </div>
                <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-slate-300 capitalize font-heading font-semibold">
                  {acc.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Collaborations & Key Decisions */}
        <div className="lg:col-span-1 space-y-8">
          {/* Teammate Collaboration */}
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-accent-blue" />
              <h2 className="text-lg font-bold font-heading text-white">Top Collaborator</h2>
            </div>
            <div className="p-4 bg-accent-blue/5 border border-accent-blue/10 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center font-bold text-accent-blue text-sm font-heading">
                PA
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-heading">{data?.collaborator?.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{data?.collaborator?.text}</p>
              </div>
            </div>
          </div>

          {/* Key Decisions */}
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-accent-purple" />
              <h2 className="text-lg font-bold font-heading text-white">Key Impact Decisions</h2>
            </div>
            <div className="space-y-3">
              {data?.keyDecisions?.map((dec: any, i: number) => (
                <div key={i} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white font-heading">{dec.title}</h4>
                    <span className="text-[9px] bg-accent-purple/10 border border-accent-purple/20 px-2 py-0.5 rounded text-accent-purple font-mono font-semibold uppercase">{dec.impact} Impact</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{dec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics: Risk Over Time & Productivity Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk timeline */}
        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-6">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400" />
            <h2 className="text-lg font-bold font-heading text-white">Workspace Risk Analysis</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.riskTimeline}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.08)", color: "#fff" }} />
                <Area type="monotone" dataKey="risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Trends */}
        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-6">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-accent-emerald" />
            <h2 className="text-lg font-bold font-heading text-white">Productivity Trends</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.productivityChanges}>
                <defs>
                  <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "rgba(255,255,255,0.08)", color: "#fff" }} />
                <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorProd)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
