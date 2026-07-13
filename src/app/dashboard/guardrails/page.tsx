"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, XCircle, Terminal, HelpCircle } from "lucide-react";

export default function GuardrailsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ai/proposals");
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const handleAction = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch("/api/ai/proposals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setProposals((prev) => prev.filter((p) => p.id !== id));
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
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">AI Guardrails Queue</h1>
        <p className="text-slate-400 text-sm mt-1">Intercepted high-impact AI tool actions waiting for human authorization.</p>
      </div>

      {proposals.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed border-white/10 rounded-[24px] bg-white/[0.01]">
          <ShieldAlert size={36} className="mx-auto text-slate-600 mb-3" />
          <p className="font-heading font-semibold text-sm">No pending proposals found. Guardrails are active.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposals.map((prop) => (
            <div key={prop.id} className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] flex flex-col justify-between space-y-4 hover:border-accent-purple/20 transition-all">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-[10px] font-mono uppercase font-bold">
                    {prop.tool_name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">ID: {prop.id.slice(0, 8)}</span>
                </div>
                <h4 className="text-sm font-bold text-white font-heading">AI requests execution of high-impact capability.</h4>
              </div>

              {/* Arguments JSON view */}
              <div className="p-4 bg-black/35 rounded-xl border border-white/5 font-mono text-[10px] text-slate-300 overflow-x-auto space-y-1">
                <div className="flex items-center gap-1.5 text-accent-cyan font-bold uppercase mb-2">
                  <Terminal size={12} /> Tool Parameters
                </div>
                <pre>{JSON.stringify(prop.args, null, 2)}</pre>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => handleAction(prop.id, "Rejected")}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-heading font-semibold transition-colors"
                >
                  <XCircle size={14} /> Deny Request
                </button>
                <button
                  onClick={() => handleAction(prop.id, "Approved")}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-accent-emerald/10 hover:bg-accent-emerald/20 border border-accent-emerald/20 text-accent-emerald text-xs font-heading font-semibold transition-colors"
                >
                  <CheckCircle size={14} /> Authorize Execution
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
