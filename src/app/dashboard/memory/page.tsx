"use client";

import { useState } from "react";
import { Sparkles, Compass, HelpCircle, HardDrive, MessageSquare, Terminal } from "lucide-react";

export default function EngineeringMemoryPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleQuery = async () => {
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      setResult(null);
      const res = await fetch("/api/ai/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Why did we switch from MongoDB to Supabase?",
    "Which decisions had the biggest impact on the database design?",
    "Who approved the standard Next.js RLS security policy?"
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Engineering Memory Platform</h1>
        <p className="text-slate-400 text-sm mt-1">Ask questions about architectural decisions, who approved them, affected services, and sprint history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ask input panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-4">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-accent-purple" />
              <h3 className="text-sm font-bold font-heading text-white">Query Engineering Memory</h3>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Why did we switch from MongoDB to Supabase?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-accent-purple/50 text-white"
              />
              <button
                onClick={handleQuery}
                disabled={loading || !prompt.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold font-heading text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                {loading ? "Recalling..." : "Query"}
              </button>
            </div>

            {/* Result view */}
            {result && (
              <div className="p-6 bg-black/35 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-wider font-heading">
                  <Sparkles size={14} /> AI Recalled Context
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-heading font-medium">
                  {result.explanation}
                </p>

                <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 text-[10px] text-slate-500 font-mono">
                  <div>📑 ADRs referenced: <span className="text-white">{result.referencedAdrs?.length || 0}</span></div>
                  <div>⏳ Audit timeline events: <span className="text-white">{result.timelineEventsCount || 0}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggestion list */}
        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] flex flex-col justify-between space-y-6 h-fit">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 font-heading">Suggested Inquiries</h3>
            <div className="space-y-2.5">
              {sampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(q)}
                  className="w-full text-left p-3 rounded-xl bg-white/[0.01] border border-white/5 text-[10px] text-slate-400 hover:bg-white/[0.03] hover:text-white transition-all font-heading font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 pt-4 border-t border-white/5 flex items-center gap-1.5">
            <HelpCircle size={12} /> Uses RAG semantic lookup over project ADRs.
          </div>
        </div>
      </div>
    </div>
  );
}
