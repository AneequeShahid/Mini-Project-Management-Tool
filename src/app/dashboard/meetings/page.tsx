"use client";
import { useState, useEffect } from "react";
import { Video, Clock, Users, FileText, Plus, Calendar, ChevronRight, Play, Square } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  standup: "#5B8CFF", review: "#8b5cf6", audit: "#ef4444",
  planning: "#f59e0b", retro: "#10b981", kickoff: "#00e5ff",
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", type: "standup", date: "", time: "09:00", duration: "30 min" });
  const [activeNotes, setActiveNotes] = useState<string | null>(null);
  const [notesMeetingTitle, setNotesMeetingTitle] = useState<string>("");

  useEffect(() => {
    fetch("/api/meetings")
      .then(r => r.json())
      .then(d => { setMeetings(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) {
      const m = await res.json();
      setMeetings(prev => [m, ...prev]);
      setShowCreate(false);
      setForm({ title: "", type: "standup", date: "", time: "09:00", duration: "30 min" });
    }
  };

  const handleShowNotes = (title: string, summary: string | null) => {
    setNotesMeetingTitle(title);
    setActiveNotes(summary || "No notes were recorded for this meeting. AI summaries are generated after recording uploads.");
  };

  const upcoming = meetings.filter(m => m.status === "upcoming");
  const past = meetings.filter(m => m.status === "completed");

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.02em", color: "#f5f5f5" }}>Meetings</h1>
          <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>Schedule and review team meetings with AI summaries</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#5B8CFF", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#000" }}
        >
          <Plus size={13} /> Schedule Meeting
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 18, padding: 28, width: 420 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5", marginBottom: 20 }}>Schedule Meeting</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: "Title", key: "title", type: "text", placeholder: "Sprint 13 Planning" },
                { label: "Date", key: "date", type: "date" },
                { label: "Time", key: "time", type: "time" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={(f as any).placeholder}
                    required
                    style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ width: "100%", background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 13, outline: "none" }}>
                  {["standup", "review", "planning", "retro", "audit", "kickoff"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "9px", background: "#1e1e20", border: "1px solid #27272A", borderRadius: 10, color: "#a1a1aa", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "9px", background: "#5B8CFF", border: "none", borderRadius: 10, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <h2 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Upcoming ({upcoming.length})</h2>
        <div className="space-y-3">
          {upcoming.map(m => (
            <div key={m.id} style={{ borderRadius: 12, padding: "16px 20px", background: "#111113", border: `1px solid ${TYPE_COLORS[m.type] || "#27272A"}22`, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${TYPE_COLORS[m.type] || "#5B8CFF"}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={18} color={TYPE_COLORS[m.type] || "#5B8CFF"} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5" }}>{m.title}</p>
                <div className="flex items-center gap-3 mt-1" style={{ fontSize: 11, color: "#52525b", fontFamily: "monospace" }}>
                  <span className="flex items-center gap-1"><Clock size={10} />{m.date} at {m.time}</span>
                  <span>·</span>
                  <span>{m.duration}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Users size={10} />{m.attendees} attendees</span>
                </div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", background: `${TYPE_COLORS[m.type] || "#5B8CFF"}15`, color: TYPE_COLORS[m.type] || "#5B8CFF", padding: "3px 8px", borderRadius: 6 }}>{m.type}</span>
              {m.join_url ? <a href={m.join_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "rgba(91,140,255,.12)", border: "1px solid rgba(91,140,255,.25)", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#8fb0ff", textDecoration: "none" }}><Play size={10} /> Open room</a> : <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#1e1e20", border: "1px solid #27272A", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#a1a1aa" }}><Play size={10} /> Prepare room</button>}
            </div>
          ))}
        </div>
      </div>

      {/* Past meetings */}
      <div>
        <h2 style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Recent ({past.length})</h2>
        <div className="space-y-3">
          {past.map(m => (
            <div key={m.id} style={{ borderRadius: 12, padding: "16px 20px", background: "#09090B", border: "1px solid #1c1c1f", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#111113", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Video size={18} color="#3f3f46" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#a1a1aa" }}>{m.title}</p>
                {m.summary && <p style={{ fontSize: 11, color: "#52525b", marginTop: 3, fontStyle: "italic" }}>AI Summary: {m.summary}</p>}
                <div className="flex items-center gap-3 mt-1" style={{ fontSize: 11, color: "#3f3f46", fontFamily: "monospace" }}>
                  <span>{m.date} · {m.duration}</span>
                  {m.recording && <span style={{ display: "flex", alignItems: "center", gap: 3, color: "#5B8CFF" }}><Square size={8} fill="#5B8CFF" />Recording available</span>}
                </div>
              </div>
              {m.recording && (
                <button 
                  onClick={() => handleShowNotes(m.title, m.summary)}
                  style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "rgba(91,140,255,0.1)", border: "1px solid rgba(91,140,255,0.2)", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#5B8CFF" }}
                >
                  <FileText size={10} /> Notes
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Notes modal */}
      {activeNotes !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111113", border: "1px solid #27272A", borderRadius: 18, padding: 28, width: 480 }}>
            <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: "1px solid #27272A" }}>
              <div className="flex items-center gap-2">
                <FileText size={16} color="#5B8CFF" />
                <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5" }}>AI Meeting Transcript & Notes</h3>
              </div>
              <button onClick={() => setActiveNotes(null)} style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer" }}>✕</button>
            </div>
            <p style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 700, marginBottom: 8 }}>{notesMeetingTitle}</p>
            <div style={{ background: "#18181B", border: "1px solid #27272A", borderRadius: 10, padding: 16, maxHeight: "250px", overflowY: "auto", fontSize: 12, color: "#71717a", lineHeight: 1.6 }}>
              <strong style={{ color: "#d4d4d8" }}>AI Digest & Takeaways:</strong>
              <p style={{ marginTop: 6 }}>{activeNotes}</p>
              <p style={{ marginTop: 12, fontSize: 11, fontStyle: "italic", color: "#52525b" }}>Generated automatically by Gravity Co-Pilot from audio transcription analysis.</p>
            </div>
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setActiveNotes(null)} 
                style={{ padding: "8px 20px", background: "#5B8CFF", border: "none", borderRadius: 8, color: "#000", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

