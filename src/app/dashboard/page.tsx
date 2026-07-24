"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Plus, Trash2, Cpu, GitPullRequest,
  Database, ShieldAlert
} from "lucide-react";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";

const activeAgents = [
  { name: "Developer Agent", task: "Writing unit tests for Auth OAuth callback sync", status: "coding", avatar: "DA" },
  { name: "QA Agent", task: "Staging regression suite tests on Vercel preview", status: "testing", avatar: "QA" },
  { name: "Planner Agent", task: "Balancing story points on Sprint 13 backlog", status: "planning", avatar: "PA" },
];

export default function DashboardPage() {
  const [focusInput, setFocusInput] = useState("");
  const [focusList, setFocusList] = useState([
    { id: "1", text: "Finalize database index optimizations", checked: true },
    { id: "2", text: "Review Developer Agent PR for Auth Module", checked: false },
    { id: "3", text: "Perform Vercel sandbox deployment test", checked: false },
  ]);

  // Dynamic states for dashboard actions
  const [authResolved, setAuthResolved] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [showStandup, setShowStandup] = useState(false);
  const [standupLoading, setStandupLoading] = useState(false);
  const [slackSuccess, setSlackSuccess] = useState(false);

  const addFocus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusInput.trim()) return;
    setFocusList([...focusList, { id: Date.now().toString(), text: focusInput.trim(), checked: false }]);
    setFocusInput("");
  };

  const toggleFocus = (id: string) =>
    setFocusList(focusList.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f)));

  const deleteFocus = (id: string) =>
    setFocusList(focusList.filter((f) => f.id !== id));

  const handleResolveAuth = () => {
    setResolveLoading(true);
    setTimeout(() => {
      setResolveLoading(false);
      setAuthResolved(true);
    }, 1500);
  };

  const handleGenerateStandup = () => {
    setStandupLoading(true);
    setTimeout(() => {
      setStandupLoading(false);
      setShowStandup(true);
    }, 1200);
  };

  const handlePostToSlack = () => {
    setSlackSuccess(true);
    setTimeout(() => {
      setSlackSuccess(false);
      setShowStandup(false);
    }, 2000);
  };

  const briefingItems = [
    { icon: "✓", col: "#10b981", text: "Yesterday your team merged 14 PRs successfully." },
    { icon: "✦", col: "#5B8CFF", text: "AI predicts Sprint 12 will finish 1 day early." },
    { icon: "✓", col: "#10b981", text: "Backend deployment has 73% success probability." },
    { icon: "⚠", col: "#f59e0b", text: "One engineer appears overloaded (standup offsets)." },
    authResolved 
      ? { icon: "✓", col: "#10b981", text: "Authentication failures successfully resolved." }
      : { icon: "𐄂", col: "#ef4444", text: "Two customers reported authentication failures." }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">

      {/* ── Hero Briefing ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: 20, padding: "24px 28px", background: "linear-gradient(135deg, #111214, #0A0A0B)", border: "1px solid #27272A", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", right: 0, top: 0, width: 320, height: 320, background: "rgba(91,140,255,0.05)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
        <div className="max-w-4xl space-y-4">
          <div className="flex items-center justify-between">
            <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.03em", color: "#f5f5f5", lineHeight: 1.1 }}>
              Good morning, Aneeque.
            </h1>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 6, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", fontSize: 9, fontFamily: "monospace", fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <Sparkles size={9} />
              AI Chief of Staff Briefing
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 32px", fontSize: 11, fontFamily: "monospace", color: "#a1a1aa", paddingTop: 4 }}>
            {briefingItems.map((b) => (
              <div key={b.text} className="flex items-center gap-2">
                <span style={{ color: b.col, fontWeight: "bold" }}>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button 
              onClick={handleResolveAuth}
              disabled={authResolved || resolveLoading}
              style={{ 
                borderRadius: 10, padding: "7px 14px", 
                background: authResolved ? "rgba(16,185,129,0.12)" : "#5B8CFF", 
                color: authResolved ? "#10b981" : "#000", 
                border: authResolved ? "1px solid rgba(16,185,129,0.2)" : "none",
                fontSize: 11, fontWeight: 700, cursor: authResolved || resolveLoading ? "default" : "pointer",
                opacity: resolveLoading ? 0.7 : 1,
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              {resolveLoading ? "Resolving with Agent..." : authResolved ? "Auth Resolved ✓" : "Resolve Auth Failures"}
            </button>
            <button 
              onClick={handleGenerateStandup}
              disabled={standupLoading}
              style={{ 
                borderRadius: 10, padding: "7px 14px", 
                background: "#18181B", color: "#d4d4d8", 
                fontSize: 11, fontWeight: 700, border: "1px solid #27272A", cursor: standupLoading ? "default" : "pointer",
                opacity: standupLoading ? 0.7 : 1,
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              {standupLoading ? "Analyzing activity..." : "Generate Standup"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── AI Daily Standup Modal ── */}
      {showStandup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 500, background: "#111214", border: "1px solid #27272A", borderRadius: 18, padding: 24, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
            <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: "1px solid #27272A" }}>
              <div className="flex items-center gap-2">
                <Cpu size={16} color="#8b5cf6" />
                <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "#f5f5f5" }}>AI Standup Digest - Sprint 12</h3>
              </div>
              <button onClick={() => setShowStandup(false)} style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer" }}>✕</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 12, color: "#a1a1aa", lineHeight: 1.5, fontFamily: "monospace" }}>
              <div>
                <strong style={{ color: "#5B8CFF" }}>• Aneeque Shahid (Lead Architect):</strong>
                <p style={{ paddingLeft: 12, color: "#71717a", marginTop: 2 }}>Fixed auth token refresh race condition. Integrating SAML SSO module.</p>
              </div>
              <div>
                <strong style={{ color: "#10b981" }}>• Jordan Lee (Developer):</strong>
                <p style={{ paddingLeft: 12, color: "#71717a", marginTop: 2 }}>Sprint Velocity charts ready. Wiring interactive timeline widget.</p>
              </div>
              <div>
                <strong style={{ color: "#8b5cf6" }}>• Maria Kim (Developer):</strong>
                <p style={{ paddingLeft: 12, color: "#71717a", marginTop: 2 }}>Running staging regression tests on Vercel preview environments.</p>
              </div>
              <div>
                <strong style={{ color: "#ef4444" }}>• Ryan Park (Developer):</strong>
                <p style={{ paddingLeft: 12, color: "#71717a", marginTop: 2 }}>Investigating workspace latency spike on first load. Blocked by API limits.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-3" style={{ borderTop: "1px solid #27272A" }}>
              <button 
                onClick={() => setShowStandup(false)} 
                style={{ flex: 1, padding: "8px", background: "none", border: "1px solid #27272A", borderRadius: 8, color: "#a1a1aa", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
              >
                Close
              </button>
              <button 
                onClick={handlePostToSlack}
                disabled={slackSuccess}
                style={{ 
                  flex: 1, padding: "8px", background: "#8b5cf6", border: "none", borderRadius: 8, color: "#fff", 
                  fontSize: 11, fontWeight: 700, cursor: slackSuccess ? "default" : "pointer" 
                }}
              >
                {slackSuccess ? "Posted to Slack! ✓" : "Broadcast to Slack #standup"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Workspace Health Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Workspace Health Monitor</span>
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "#5B8CFF" }}>Real-Time Context Sync</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {[
            { label: "Engineering Pulse", value: "98%", delta: "↑ +3%", color: "#10b981", note: "AI Confidence High" },
            { label: "Delivery Confidence", value: "92%", delta: "↑ +1.2%", color: "#5B8CFF", note: "Sprint Variance" },
            { label: "Deployment Risk", value: "Low", delta: "", color: "#10b981", note: "Optimal Build Path" },
            { label: "Blocked Engineers", value: "2 dev", delta: "", color: "#ef4444", note: "Action Required", pulse: true },
            { label: "Focus Time Today", value: "4h 12m", delta: "", color: "#8b5cf6", note: "↑ +40m focus slot" },
          ].map((card) => (
            <div key={card.label} style={{ borderRadius: 12, padding: 12, background: "#111214", border: `1px solid ${card.color}22`, height: 96, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: card.pulse ? `0 0 15px ${card.color}1a` : undefined }}>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</span>
              <div className="flex items-baseline gap-1.5">
                <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: card.color }}>{card.value}</span>
                {card.delta && <span style={{ fontSize: 9, fontFamily: "monospace", color: card.color }}>{card.delta}</span>}
              </div>
              <div className="flex items-center gap-1" style={{ fontSize: 9, fontFamily: "monospace", color: card.pulse ? card.color : "#52525b" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: card.color, display: "inline-block", animation: card.pulse ? "ping 1s cubic-bezier(0,0,.2,1) infinite" : undefined }} />
                {card.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Two-Column Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24 }}>

        {/* Left */}
        <div className="space-y-6">

          {/* Today's Priorities */}
          <div style={{ borderRadius: 12, padding: 20, background: "#111214", border: "1px solid #27272A" }}>
            <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: "1px solid #27272A" }}>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Today's Priorities</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b" }}>{focusList.filter((f) => f.checked).length} of {focusList.length} done</span>
            </div>

            <div className="space-y-2">
              {focusList.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#17181C", border: "1px solid #27272A", borderRadius: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleFocus(item.id)}
                      style={{ width: 14, height: 14, accentColor: "#5B8CFF" }}
                    />
                    <span style={{ fontSize: 13, color: item.checked ? "#52525b" : "#d4d4d8", textDecoration: item.checked ? "line-through" : "none" }}>
                      {item.text}
                    </span>
                  </label>
                  <button onClick={() => deleteFocus(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#52525b", padding: 4 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={addFocus} className="flex gap-2 pt-3">
              <input
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                placeholder="Add custom task..."
                style={{ flex: 1, background: "#18181B", border: "1px solid #27272A", borderRadius: 8, padding: "8px 12px", color: "#f5f5f5", fontSize: 12, outline: "none" }}
              />
              <button type="submit" style={{ padding: "8px 14px", background: "#5B8CFF", borderRadius: 8, border: "none", cursor: "pointer", color: "#000", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <Plus size={12} /> Add
              </button>
            </form>
          </div>

          {/* Delivery Forecast */}
          <div style={{ borderRadius: 12, padding: 20, background: "#09090B", border: "1px solid #27272A" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em" }}>Delivery Forecast</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#52525b" }}>Sprint 12 Range</span>
            </div>
            <div style={{ background: "#111214", border: "1px solid #27272A", borderRadius: 10, padding: 16, overflow: "hidden" }}>
              <svg viewBox="0 0 600 80" style={{ width: "100%" }}>
                <line x1="0" y1="20" x2="600" y2="20" stroke="#27272A" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="600" y2="50" stroke="#27272A" strokeWidth="0.5" />
                <line x1="150" y1="0" x2="150" y2="80" stroke="#27272A" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="300" y1="0" x2="300" y2="80" stroke="#27272A" strokeWidth="0.5" strokeDasharray="2 2" />
                <line x1="450" y1="0" x2="450" y2="80" stroke="#27272A" strokeWidth="0.5" strokeDasharray="2 2" />
                <text x="20" y="14" fill="#52525b" fontSize="10" fontFamily="monospace">Mon</text>
                <text x="170" y="14" fill="#52525b" fontSize="10" fontFamily="monospace">Tue</text>
                <text x="320" y="14" fill="#52525b" fontSize="10" fontFamily="monospace">Wed</text>
                <text x="470" y="14" fill="#52525b" fontSize="10" fontFamily="monospace">Thu</text>
                <rect x="40" y="28" width="240" height="12" rx="4" fill="#5B8CFF" opacity="0.85" />
                <text x="50" y="37" fill="#000" fontSize="9" fontWeight="bold">UI Overhaul</text>
                <rect x="260" y="48" width="280" height="12" rx="4" fill="#10b981" opacity="0.85" />
                <text x="270" y="57" fill="#000" fontSize="9" fontWeight="bold">SDK Sync</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">

          {/* Engineering Memory */}
          <div style={{ borderRadius: 12, padding: 20, background: "#111214", border: "1px solid #27272A", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: 0, top: 0, width: 80, height: 80, background: "rgba(91,140,255,0.05)", borderRadius: "50%", filter: "blur(24px)", pointerEvents: "none" }} />
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={15} color="#5B8CFF" />
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#f5f5f5", textTransform: "uppercase", letterSpacing: "0.06em" }}>Engineering Memory</span>
            </div>
            <div style={{ background: "#18181B", borderRadius: 8, border: "1px solid rgba(39,39,42,0.8)", padding: 12, fontFamily: "monospace", fontSize: 10, marginBottom: 12 }}>
              {[["Vector Index:", "Ready"], ["Indexed Docs:", "6,242 nodes"], ["Last Sync:", "2 min ago"]].map(([k, v]) => (
                <div key={k} className="flex justify-between mb-1.5" style={{ color: "#52525b" }}>
                  <span>{k}</span>
                  <span style={{ color: k === "Last Sync:" ? "#5B8CFF" : "#d4d4d8" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, display: "flex", gap: 10 }}>
              <ShieldAlert size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#fca5a5" }}>2FA compliance check failed</p>
                <p style={{ fontSize: 10, color: "#52525b", marginTop: 2 }}>18 user accounts lack active token sync status.</p>
              </div>
            </div>
          </div>

          {/* Agent Coordination */}
          <div style={{ borderRadius: 12, padding: 20, background: "#111214", border: "1px solid #27272A" }}>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 14 }}>Agent Coordination</span>
            <div className="space-y-4">
              {activeAgents.map((agent) => (
                <div key={agent.name} className="flex gap-3">
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: "#18181B", border: "1px solid #27272A", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "#5B8CFF", flexShrink: 0 }}>
                    {agent.avatar}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex justify-between items-center">
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#d4d4d8" }}>{agent.name}</p>
                      <span style={{ fontSize: 8, background: "#1e1e20", color: "#a1a1aa", fontFamily: "monospace", padding: "1px 5px", borderRadius: 4, textTransform: "uppercase" }}>{agent.status}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#52525b", lineHeight: 1.5, marginTop: 2 }}>{agent.task}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Repository Health */}
          <div style={{ borderRadius: 12, padding: 20, background: "#09090B", border: "1px solid #27272A" }}>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 12 }}>Repository Health</span>
            {[
              { icon: GitPullRequest, color: "#8b5cf6", repo: "PulseHQ/auth" },
              { icon: Database, color: "#00e5ff", repo: "PulseHQ/db-core" },
            ].map(({ icon: Icon, color, repo }) => (
              <div key={repo} className="flex items-center justify-between mb-2" style={{ padding: "10px 12px", background: "#111113", borderRadius: 8 }}>
                <div className="flex items-center gap-2">
                  <Icon size={13} color={color} />
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#d4d4d8" }}>{repo}</span>
                </div>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#10b981" }}>Passing</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <DashboardAnalytics />
    </div>
  );
}
