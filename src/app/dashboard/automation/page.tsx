"use client";

import { useState, useEffect } from "react";
import { Play, Settings, ShieldCheck, HelpCircle, GitCommit, GitBranch, ArrowRight, Plus, X, RefreshCw } from "lucide-react";

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("GITHUB_PUSH");
  const [actionType, setActionType] = useState("SLACK_MESSAGE");
  const [creating, setCreating] = useState(false);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data);
      }
    } catch (err) {
      console.error("Failed to fetch workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setCreating(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          triggerType,
          actions: [{ type: actionType }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWorkflows(prev => [data, ...prev]);
        setIsModalOpen(false);
        setName("");
      }
    } catch (err) {
      console.error("Failed to create workflow:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleTriggerWorkflow = async (workflowId: string) => {
    try {
      await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "trigger",
          workflowId,
          payload: { timestamp: new Date().toISOString() },
        }),
      });
      alert("Workflow execution triggered successfully!");
    } catch (err) {
      console.error("Trigger workflow failed:", err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up relative">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Workflow Automations</h1>
          <p className="text-slate-400 text-sm mt-1">Configure event-driven workflows mapping system activities to external integrations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue text-white text-xs font-bold font-heading rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={14} /> Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workflows list */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <p className="text-xs text-slate-500 font-mono">Loading active workflows from database...</p>
          ) : workflows.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-[28px] text-center text-xs text-slate-500">
              No workflow automations defined. Click "Create Workflow" to get started.
            </div>
          ) : (
            workflows.map((wf) => (
              <div key={wf.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[24px] backdrop-blur-[24px] flex items-center justify-between hover:border-accent-purple/20 transition-all duration-300">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-heading">{wf.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${wf.active ? "text-accent-emerald bg-accent-emerald/10 border border-accent-emerald/20" : "text-slate-500 bg-white/5 border border-white/10"}`}>
                      {wf.active ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="px-2 py-1 bg-white/5 rounded border border-white/5 text-accent-cyan font-bold">{wf.trigger_type}</span>
                    <ArrowRight size={14} className="text-slate-600" />
                    <span className="px-2 py-1 bg-white/5 rounded border border-white/5 text-accent-purple font-bold">
                      {wf.actions?.[0]?.type || "ACTION"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTriggerWorkflow(wf.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-accent-purple/10 hover:bg-accent-purple/20 text-xs font-semibold text-accent-purple font-heading border border-accent-purple/20 rounded-xl transition-colors cursor-pointer"
                  >
                    <Play size={12} /> Trigger
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info panel */}
        <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[28px] backdrop-blur-[24px] flex flex-col justify-between space-y-6 h-fit">
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 font-heading">Event Dispatcher Bus</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every workflow executes asynchronously from the central **Event Bus**. When an event matches the trigger criteria, the action dispatcher logs payload inputs and posts metrics onto Vercel logs.
            </p>
          </div>

          <div className="text-[10px] text-slate-500 pt-4 border-t border-white/5 flex items-center gap-1.5">
            <HelpCircle size={12} /> Integrates with n8n Cloud triggers.
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
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
              <h2 className="text-xl font-bold font-heading text-white">Create Automation</h2>
              <p className="text-xs text-slate-400">Map system workspace triggers directly to integration actions.</p>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Workflow Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broadcast GitHub Commits"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Event Trigger</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple/40"
                  >
                    <option value="GITHUB_PUSH" className="bg-bg-dark">GitHub Push</option>
                    <option value="TASK_CREATED" className="bg-bg-dark">Task Created</option>
                    <option value="RISK_ALERT" className="bg-bg-dark">Risk Alert</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Action Integration</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent-purple/40"
                  >
                    <option value="SLACK_MESSAGE" className="bg-bg-dark">Slack Message</option>
                    <option value="EMAIL" className="bg-bg-dark">Email Notification</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {creating ? <RefreshCw size={14} className="animate-spin" /> : "Create Workflow"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
