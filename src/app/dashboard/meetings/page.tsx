"use client";

import { useState, useEffect } from "react";
import { Video, Calendar, Clock, ArrowUpRight, Plus, X, RefreshCw } from "lucide-react";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([
    { id: "meet_1", topic: "Sprint 15 Kickoff", startTime: "2026-07-09T10:00:00Z", duration: 30, provider: "Zoom", link: "https://zoom.us/j/12345678" },
    { id: "meet_2", topic: "ADR Review: Supabase Migration", startTime: "2026-07-09T14:30:00Z", duration: 45, provider: "Google Meet", link: "https://meet.google.com/abc-defg-hij" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [provider, setProvider] = useState("Zoom");
  const [loading, setLoading] = useState(false);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !startTime) return;

    setLoading(true);
    try {
      let endpoint = "/api/integrations/zoom/meetings";
      let payload: any = { topic, startTime, duration: parseInt(duration) };

      if (provider === "Google Meet") {
        endpoint = "/api/integrations/calendar/events";
        payload = {
          summary: topic,
          description: "Scheduled via Gravity Conferences Portal",
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(new Date(startTime).getTime() + parseInt(duration) * 60000).toISOString(),
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const newMeeting = {
          id: data.id || data.meetingId || Math.random().toString(),
          topic: data.title || data.topic || topic,
          startTime: startTime,
          duration: parseInt(duration),
          provider: provider,
          link: data.link || data.meetLink || data.joinUrl || "https://gravity.io",
        };

        setMeetings(prev => [newMeeting, ...prev]);
        setIsModalOpen(false);
        setTopic("");
        setStartTime("");
      }
    } catch (err) {
      console.error("Failed to schedule meeting:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up relative">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Video Conferences</h1>
          <p className="text-slate-400 text-sm mt-1">Schedule and manage Google Meet, Microsoft Teams, and Zoom conferences.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue text-white text-xs font-bold font-heading rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={14} /> Schedule Meeting
        </button>
      </div>

      {/* Grid of Scheduled Meetings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.map((meet) => (
          <div key={meet.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[28px] backdrop-blur-[24px] flex flex-col justify-between space-y-6 hover:border-accent-purple/20 transition-all duration-300 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-purple/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-mono uppercase font-bold">
                  {meet.provider}
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock size={10} /> {meet.duration} Min
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white font-heading">{meet.topic}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {new Date(meet.startTime).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5 relative z-10">
              <a
                href={meet.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-4 py-2 bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/20 text-accent-purple text-xs font-heading font-semibold rounded-xl transition-colors"
              >
                Join Meeting <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Glassmorphic Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-bg-dark border border-white/10 p-6 rounded-[28px] max-w-md w-full space-y-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X size={16} />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-heading text-white">Schedule Conference</h2>
              <p className="text-xs text-slate-400">Generate real meeting credentials from your connected providers.</p>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Meeting Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint Sync Review"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Duration (Minutes)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple/40"
                  >
                    <option value="15" className="bg-bg-dark">15 Mins</option>
                    <option value="30" className="bg-bg-dark">30 Mins</option>
                    <option value="45" className="bg-bg-dark">45 Mins</option>
                    <option value="60" className="bg-bg-dark">60 Mins</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Integration Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple/40"
                >
                  <option value="Zoom" className="bg-bg-dark">Zoom Meetings</option>
                  <option value="Google Meet" className="bg-bg-dark">Google Meet</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : "Schedule"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
