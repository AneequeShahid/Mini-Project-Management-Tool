"use client";

import { useState, useEffect } from "react";
import { Sparkles, GitPullRequest, Shield, FileText, CheckCircle2, XCircle } from "lucide-react";
import { SkeletonCard } from "@/components/Skeleton";

export default function AdrDashboard() {
  const [adrs, setAdrs] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const projsRes = await fetch("/api/projects");
      if (projsRes.ok) {
        const projs = await projsRes.json();
        if (projs.length > 0) {
          setProjectId(projs[0].id);
          const adrsRes = await fetch(`/api/ai/adr?projectId=${projs[0].id}`);
          if (adrsRes.ok) {
            const data = await adrsRes.json();
            setAdrs(data);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load ADRs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdr = async () => {
    if (!prompt.trim() || !projectId) return;
    try {
      setGenerating(true);
      const res = await fetch("/api/ai/adr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, prompt }),
      });
      if (!res.ok) throw new Error("ADR generation failed");
      const newAdr = await res.json();
      setAdrs((prev) => [newAdr, ...prev]);
      setPrompt("");
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/ai/adr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setAdrs((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Architecture Decision Records</h1>
        <p className="text-slate-400 text-sm mt-1">AI-generated log of structural architectural proposals, impacts, approvals, and history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create ADR panel */}
        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-4 h-fit">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-purple" />
            <h3 className="text-sm font-bold font-heading text-white">Generate ADR Proposal</h3>
          </div>
          <div className="space-y-3">
            <textarea
              placeholder="e.g. Implement multi-region replication for Supabase database layer to support high-availability..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-accent-purple/50 text-white resize-none"
            />
            <button
              onClick={handleCreateAdr}
              disabled={generating || !prompt.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold font-heading text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              {generating ? "Architect Agent is thinking..." : "Generate Decision Record"}
            </button>
          </div>
        </div>

        {/* List of ADRs */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400 font-heading">Decision Log History</p>
          {adrs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
              No Architecture Decisions recorded yet. Generate one to start!
            </div>
          ) : (
            adrs.map((adr) => (
              <div key={adr.id} className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="text-accent-blue" size={20} />
                    <div>
                      <h4 className="text-sm font-bold text-white font-heading">{adr.title}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Created at: {new Date(adr.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Status badge & quick buttons */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider font-heading border ${
                      adr.status === "Accepted" 
                        ? "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald"
                        : adr.status === "Rejected"
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-white/5 border-white/10 text-slate-300"
                    }`}>
                      {adr.status}
                    </span>
                  </div>
                </div>

                {/* Markdown content preview */}
                <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                    {adr.content}
                  </p>
                </div>

                {/* Actions */}
                {adr.status === "Proposed" && (
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleUpdateStatus(adr.id, "Rejected")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 text-[10px] font-heading font-semibold transition-colors"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(adr.id, "Accepted")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-emerald/10 hover:bg-accent-emerald/20 border border-accent-emerald/20 text-accent-emerald text-[10px] font-heading font-semibold transition-colors"
                    >
                      <CheckCircle2 size={12} /> Accept ADR
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
