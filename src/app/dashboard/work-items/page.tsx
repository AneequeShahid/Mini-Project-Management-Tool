"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Filter, CheckSquare, Clock, AlertTriangle, Circle, ChevronDown, X, MoreHorizontal, Trash2, Edit3, ArrowUp, ArrowDown, Minus } from "lucide-react";

const STATUS_OPTIONS = ["Backlog", "Todo", "In Progress", "In Review", "Done"];
const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];
const STATUS_COLORS: Record<string, string> = { Backlog: "#3f3f46", Todo: "#a1a1aa", "In Progress": "#5B8CFF", "In Review": "#8b5cf6", Done: "#10b981" };
const PRIORITY_COLORS: Record<string, string> = { Critical: "#ef4444", High: "#f59e0b", Medium: "#5B8CFF", Low: "#71717a" };
const PRIORITY_ICONS: Record<string, any> = { Critical: ArrowUp, High: ArrowUp, Medium: Minus, Low: ArrowDown };

export default function WorkItemsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium", status: "Todo", story_points: 3 });

  useEffect(() => {
    fetch("/api/tasks").then(r => r.json()).then(d => { setTasks(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = tasks
    .filter(t => filterStatus === "all" || t.status === filterStatus)
    .filter(t => filterPriority === "all" || t.priority === filterPriority)
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === "priority" ? PRIORITY_OPTIONS.indexOf(a.priority) - PRIORITY_OPTIONS.indexOf(b.priority) : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, project_id: "proj-1", sprint_id: "spr-1", assignee: "AS", due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), work_item_type_id: "type-1" }) });
    if (res.ok) { const t = await res.json(); setTasks(prev => [t, ...prev]); setShowCreate(false); setForm({ title: "", description: "", priority: "Medium", status: "Todo", story_points: 3 }); }
  };

  const updateStatus = (id: string, status: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const statusCounts = STATUS_OPTIONS.map(s => ({ status: s, count: tasks.filter(t => t.status === s).length }));

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Work Items</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>{tasks.length} items across all projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#5B8CFF", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#000" }}>
          <Plus size={13} /> New Work Item
        </button>
      </div>

      {/* Status pipeline */}
      <div style={{ display: "flex", gap: 6 }}>
        {statusCounts.map(s => (
          <button key={s.status} onClick={() => setFilterStatus(filterStatus === s.status ? "all" : s.status)} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid", textAlign: "center", cursor: "pointer", borderColor: filterStatus === s.status ? STATUS_COLORS[s.status] : "#27272A", background: filterStatus === s.status ? `${STATUS_COLORS[s.status]}12` : "#111113" }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: STATUS_COLORS[s.status], fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{s.count}</p>
            <p style={{ fontSize: 9, color: "#52525b", textTransform: "uppercase", fontFamily: "monospace", marginTop: 2 }}>{s.status}</p>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex gap-3">
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={14} color="#3f3f46" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search work items..." style={{ width: "100%", background: "#111113", border: "1px solid #27272A", borderRadius: 10, padding: "9px 12px 9px 34px", color: "#f5f5f5", fontSize: 12, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 10, padding: "9px 12px", color: "#a1a1aa", fontSize: 12, outline: "none" }}>
          <option value="all">All Priorities</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 10, padding: "9px 12px", color: "#a1a1aa", fontSize: 12, outline: "none" }}>
          <option value="created_at">Newest</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 18, padding: 28, width: 460 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5", marginBottom: 20 }}>New Work Item</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Title</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Implement feature..." required style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Details..." rows={3} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div className="flex gap-3">
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none" }}>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Story Points</label>
                  <input type="number" value={form.story_points} onChange={e => setForm(p => ({ ...p, story_points: Number(e.target.value) }))} min={1} max={21} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "9px", background: "#1e1e20", border: "1px solid #27272A", borderRadius: 10, color: "#a1a1aa", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "9px", background: "#5B8CFF", border: "none", borderRadius: 10, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map(task => {
          const PIcon = PRIORITY_ICONS[task.priority] || Minus;
          return (
            <div key={task.id} style={{ borderRadius: 10, padding: "14px 18px", background: "#111113", border: "1px solid #27272A", display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={() => updateStatus(task.id, task.status === "Done" ? "Todo" : "Done")} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
                {task.status === "Done" ? <CheckSquare size={16} color="#10b981" /> : <Circle size={16} color="#3f3f46" />}
              </button>
              <PIcon size={12} color={PRIORITY_COLORS[task.priority]} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: task.status === "Done" ? "#52525b" : "#f5f5f5", textDecoration: task.status === "Done" ? "line-through" : "none" }}>{task.title}</p>
                <p style={{ fontSize: 10, color: "#3f3f46", fontFamily: "monospace", marginTop: 2 }}>{task.assignee} · {task.story_points}pts · {task.due_date}</p>
              </div>
              <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)} style={{ background: `${STATUS_COLORS[task.status]}12`, border: `1px solid ${STATUS_COLORS[task.status]}33`, borderRadius: 6, padding: "4px 8px", color: STATUS_COLORS[task.status], fontSize: 10, fontWeight: 700, outline: "none", cursor: "pointer" }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => deleteTask(task.id)} style={{ width: 28, height: 28, borderRadius: 6, background: "#1e1e20", border: "1px solid #27272A", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Trash2 size={11} color="#52525b" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
