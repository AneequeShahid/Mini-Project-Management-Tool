"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BURNDOWN_DATA, TEAM_MEMBERS, VELOCITY_DATA } from "@/lib/data";

const chartStyle = { background: "#111214", border: "1px solid #27272A", borderRadius: 12, padding: 16 };
const tooltip = { contentStyle: { background: "#18181B", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 11 } };

export function DashboardAnalytics() {
  const mergeRate = VELOCITY_DATA.map((item, index) => ({ sprint: item.sprint, merged: 9 + index * 2, opened: 13 + index * 2 }));
  const workload = TEAM_MEMBERS.map((member) => ({ member: member.name.split(" ")[0], allocated: member.allocation, capacity: member.capacity }));
  const charts = [
    { title: "Sprint velocity", body: <ResponsiveContainer width="100%" height="100%"><AreaChart data={VELOCITY_DATA}><CartesianGrid stroke="#27272A" vertical={false} /><XAxis dataKey="sprint" stroke="#71717a" fontSize={10} /><YAxis stroke="#71717a" fontSize={10} /><Tooltip {...tooltip} /><Area type="monotone" dataKey="delivered" stroke="#5B8CFF" fill="#5B8CFF" fillOpacity={0.25} /></AreaChart></ResponsiveContainer> },
    { title: "Sprint burn-down", body: <ResponsiveContainer width="100%" height="100%"><LineChart data={BURNDOWN_DATA}><CartesianGrid stroke="#27272A" vertical={false} /><XAxis dataKey="day" stroke="#71717a" fontSize={10} /><YAxis stroke="#71717a" fontSize={10} /><Tooltip {...tooltip} /><Legend wrapperStyle={{ fontSize: 10 }} /><Line type="monotone" dataKey="remaining" stroke="#f59e0b" strokeWidth={2} /><Line type="monotone" dataKey="ideal" stroke="#71717a" strokeDasharray="4 4" /></LineChart></ResponsiveContainer> },
    { title: "PR merge rate", body: <ResponsiveContainer width="100%" height="100%"><BarChart data={mergeRate}><CartesianGrid stroke="#27272A" vertical={false} /><XAxis dataKey="sprint" stroke="#71717a" fontSize={10} /><YAxis stroke="#71717a" fontSize={10} /><Tooltip {...tooltip} /><Bar dataKey="merged" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="opened" fill="#8b5cf6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer> },
    { title: "Team workload", body: <ResponsiveContainer width="100%" height="100%"><RadarChart data={workload}><PolarGrid stroke="#3f3f46" /><PolarAngleAxis dataKey="member" tick={{ fill: "#a1a1aa", fontSize: 10 }} /><Radar dataKey="allocated" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35} /><Tooltip {...tooltip} /></RadarChart></ResponsiveContainer> },
  ];

  return <section><p style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Delivery analytics</p><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>{charts.map((chart) => <div key={chart.title} style={chartStyle}><p style={{ color: "#d4d4d8", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>{chart.title}</p><div style={{ height: 190 }}>{chart.body}</div></div>)}</div></section>;
}
