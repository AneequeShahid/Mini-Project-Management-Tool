"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, BrainCircuit, ChevronDown, ShieldCheck, Sparkles, TrendingDown, TrendingUp, UsersRound } from "lucide-react";

const scoreColor = (score: number) => score >= 88 ? "#10b981" : score >= 76 ? "#5B8CFF" : "#f59e0b";

export default function TeamIntelligencePage() {
  const [data, setData] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () => fetch("/api/team").then((response) => response.json()).then(setData).catch(() => setData(null));
  useEffect(() => { load(); }, []);
  const members = useMemo(() => (data?.members || []).filter((member: any) => selectedRole === "all" || member.access_role === selectedRole), [data, selectedRole]);

  const changeRole = async (memberId: string, role: string) => {
    setSavingId(memberId);
    const response = await fetch("/api/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId, role }) });
    if (response.ok) load();
    setSavingId(null);
  };

  if (!data) return <div className="min-h-[45vh] grid place-items-center"><div className="w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" /></div>;

  return <div className="max-w-7xl mx-auto space-y-7 animate-slide-up">
    <section className="relative overflow-hidden rounded-[28px] p-7 border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(91,140,255,.18),transparent_32%),linear-gradient(135deg,#111827,#09090b)]">
      <div className="absolute -right-8 -bottom-12 w-64 h-64 rounded-full bg-accent-purple/10 blur-3xl" />
      <div className="relative flex flex-col lg:flex-row gap-6 lg:items-end lg:justify-between">
        <div><div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-widest"><BrainCircuit size={14} /> Team intelligence</div><h1 className="mt-3 text-4xl font-bold font-heading text-white tracking-tight">A smaller team, running like a great one.</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Role-aware planning, delivery signals, and shareable proof of how your team ships—not a generic Jira clone.</p></div>
        <div className="flex gap-3"><div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Team delivery</p><p className="text-2xl font-bold text-accent-emerald">{data.members.length ? Math.round(data.members.reduce((sum: number, member: any) => sum + (member.delivery_score || 0), 0) / data.members.length) : 0}%</p></div><div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10"><p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Your access</p><p className="text-2xl font-bold text-white capitalize">{data.currentRole}</p></div></div>
      </div>
    </section>

    <section className="grid lg:grid-cols-[1.1fr_.9fr] gap-6">
      <div className="p-6 rounded-[24px] bg-white/[.03] border border-white/10"><div className="flex items-center gap-2"><BarChart3 size={16} className="text-accent-purple"/><h2 className="text-lg font-bold font-heading text-white">Delivery forecast</h2></div><p className="mt-1 text-xs text-slate-400">ML-ready forecast based on stable velocity, scope pressure, quality, and capacity.</p><div className="mt-6 grid grid-cols-3 gap-3"><div><p className="text-[10px] text-slate-500 uppercase font-bold">Confidence</p><p className="text-3xl font-bold text-accent-emerald">87%</p></div><div><p className="text-[10px] text-slate-500 uppercase font-bold">Likely finish</p><p className="text-lg font-bold text-white">Jul 19</p></div><div><p className="text-[10px] text-slate-500 uppercase font-bold">Risk</p><p className="text-lg font-bold text-amber-400">Moderate</p></div></div><div className="mt-6 space-y-3">{[{ label: "Velocity stability", value: 92 }, { label: "Workload balance", value: 74 }, { label: "PR review flow", value: 88 }, { label: "Defect pressure", value: 71 }].map((factor) => <div key={factor.label}><div className="flex justify-between text-xs mb-1"><span className="text-slate-400">{factor.label}</span><span className="text-white font-semibold">{factor.value}%</span></div><div className="h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: `${factor.value}%`, background: scoreColor(factor.value) }} /></div></div>)}</div></div>
      <div className="p-6 rounded-[24px] bg-white/[.03] border border-white/10"><div className="flex items-center gap-2"><ShieldCheck size={16} className="text-accent-emerald"/><h2 className="text-lg font-bold font-heading text-white">Role-first workspace</h2></div><p className="mt-1 text-xs text-slate-400">Access scales from read-only stakeholders to workspace owners without adding enterprise overhead.</p><div className="mt-5 space-y-3">{data.roles.map((role: any) => <div key={role.id} className="flex gap-3 p-3 rounded-xl bg-white/[.025] border border-white/5"><span className="mt-1 w-2 h-2 rounded-full" style={{ background: role.color }} /><div><p className="text-xs font-bold text-white">{role.label}</p><p className="mt-0.5 text-[11px] text-slate-500">{role.description}</p></div></div>)}</div></div>
    </section>

    <section className="rounded-[24px] bg-white/[.03] border border-white/10 overflow-hidden"><div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"><div className="flex items-center gap-2"><UsersRound size={17} className="text-accent-blue"/><div><h2 className="text-lg font-bold font-heading text-white">Team health and contribution</h2><p className="text-xs text-slate-400">AI summaries are decision support, not employee or HR decisions.</p></div></div><select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"><option value="all">All access levels</option>{data.roles.map((role: any) => <option key={role.id} value={role.id}>{role.label}</option>)}</select></div><div className="divide-y divide-white/5">{members.map((member: any, index: number) => <div key={member.id} className="p-5 grid md:grid-cols-[1.4fr_1fr_1fr_auto] gap-4 items-center"><div><div className="flex items-center gap-3"><div className="w-9 h-9 grid place-items-center rounded-xl bg-accent-blue/10 text-xs font-bold text-accent-blue">{member.name.split(" ").map((part: string) => part[0]).join("")}</div><div><p className="text-sm font-bold text-white">{member.name}</p><p className="text-[11px] text-slate-500">{member.role} · {member.completed_points} points delivered</p></div></div><p className="mt-2 text-[11px] leading-relaxed text-slate-400">{member.ai_summary}</p></div><div className="flex gap-3">{[["Delivery", member.delivery_score], ["Quality", member.quality_score], ["Collab", member.collaboration_score]].map(([label, score]: any) => <div key={label}><p className="text-[9px] uppercase font-bold text-slate-500">{label}</p><p className="text-base font-bold" style={{ color: scoreColor(score) }}>{score}</p></div>)}</div><div className="flex items-center gap-2 text-xs"><span className={member.growth_trend === "at-risk" ? "text-amber-400" : "text-accent-emerald"}>{member.growth_trend === "at-risk" ? <TrendingDown size={14}/> : <TrendingUp size={14}/>}</span><span className="capitalize text-slate-300">{member.growth_trend}</span></div><div className="relative"><select disabled={savingId === member.id || !data.permissions.includes("members:manage")} value={member.access_role} onChange={(event) => changeRole(member.id, event.target.value)} className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-7 text-[11px] text-white outline-none disabled:opacity-50">{data.roles.map((role: any) => <option key={role.id} value={role.id}>{role.label}</option>)}</select><ChevronDown size={12} className="absolute right-2 top-2.5 pointer-events-none text-slate-500"/></div></div>)}</div></section>
    <p className="text-center text-[11px] text-slate-500 flex justify-center gap-1.5 items-center"><Sparkles size={12} className="text-accent-purple"/> Built for portfolio-worthy team execution: clear outcomes, healthy collaboration, and credible delivery signals.</p>
  </div>;
}
