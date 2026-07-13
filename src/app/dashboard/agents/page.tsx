"use client";

import { useState } from "react";
import { Cpu, MessageSquare, ShieldCheck, Zap, Sparkles, AlertCircle } from "lucide-react";

export default function AgentsDashboard() {
  const [activePersona, setActivePersona] = useState("developer");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const agents = [
    { id: "planner", name: "Planner Agent", desc: "Strategy & Backlog breakdown", success: 94, hallucination: 2, latency: 1.2, cost: 0.0004 },
    { id: "architect", name: "Architect Agent", desc: "ADRs & Database designs", success: 96, hallucination: 1, latency: 2.1, cost: 0.0008 },
    { id: "developer", name: "Developer Agent", desc: "Implementation & Code blocks", success: 91, hallucination: 4, latency: 1.8, cost: 0.0006 },
    { id: "reviewer", name: "Reviewer Agent", desc: "Code quality & Compliance check", success: 98, hallucination: 0, latency: 1.5, cost: 0.0003 },
    { id: "qa", name: "QA Agent", desc: "Stability & Boundary tests", success: 92, hallucination: 3, latency: 1.4, cost: 0.0004 },
    { id: "manager", name: "Manager Agent", desc: "Velocities & Resource safety", success: 95, hallucination: 2, latency: 1.1, cost: 0.0002 },
  ];

  const handleTestPrompt = async () => {
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      setResponse("");
      setMetrics(null);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          persona: activePersona
        }),
      });

      if (!res.ok) throw new Error("AI call failed");
      const data = await res.json();
      setResponse(data.reply);
      setMetrics(data.metrics);
    } catch (err) {
      console.error(err);
      setResponse("Sandbox run failed. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const selectedAgent = agents.find((a) => a.id === activePersona) || agents[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">AI Agent Control Deck</h1>
        <p className="text-slate-400 text-sm mt-1">Configure specialist agent personas, inspect latency profiles, and run self-reflection sandboxes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Cards Selection */}
        <div className="space-y-3">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400 font-heading">AI OS Personas</p>
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setActivePersona(agent.id)}
              className={`w-full text-left p-4 rounded-[20px] transition-all flex items-center justify-between border ${
                activePersona === agent.id 
                  ? "bg-accent-purple/10 border-accent-purple/30 text-white" 
                  : "bg-white/[0.01] border-white/5 text-slate-400 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <div>
                <h4 className="text-xs font-bold font-heading">{agent.name}</h4>
                <p className="text-[10px] opacity-80 mt-0.5">{agent.desc}</p>
              </div>
              <span className={`w-2 h-2 rounded-full ${activePersona === agent.id ? "bg-accent-purple animate-pulse" : "bg-slate-600"}`} />
            </button>
          ))}
        </div>

        {/* Selected Agent Stats Deck & Sandbox */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metrics Panel */}
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Success Rate</p>
              <p className="text-xl font-extrabold text-accent-emerald font-heading">{selectedAgent.success}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Hallucinations</p>
              <p className="text-xl font-extrabold text-red-400 font-heading">{selectedAgent.hallucination}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Latency</p>
              <p className="text-xl font-extrabold text-accent-cyan font-heading">{selectedAgent.latency}s</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Cost per Token</p>
              <p className="text-xl font-extrabold text-accent-purple font-heading">${selectedAgent.cost}</p>
            </div>
          </div>

          {/* Sandbox Terminal */}
          <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-[24px] space-y-4">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-accent-purple" />
              <h3 className="text-sm font-bold font-heading text-white">Sandbox Run</h3>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={`Prompt ${selectedAgent.name} (e.g. Write task list for login screen)...`}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTestPrompt()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-accent-purple/50 text-white"
              />
              <button
                onClick={handleTestPrompt}
                disabled={loading || !prompt.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-purple to-accent-blue text-white font-bold font-heading text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                {loading ? "Running..." : "Run"}
              </button>
            </div>

            {/* Sandbox Response Output */}
            {response && (
              <div className="p-4 bg-black/35 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center gap-1.5 text-accent-emerald text-[10px] font-bold uppercase">
                  <ShieldCheck size={14} /> Output Verified via Self-Reflection Critique
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                  {response}
                </p>

                {metrics && (
                  <div className="pt-3 border-t border-white/5 flex flex-wrap gap-4 text-[9px] text-slate-400 font-mono">
                    <div>⏱ Latency: <span className="text-white font-semibold">{metrics.latencyMs}ms</span></div>
                    <div>💰 Cost: <span className="text-white font-semibold">${metrics.estimatedCost}</span></div>
                    <div>🔮 Model: <span className="text-white font-semibold">{metrics.modelUsed.split("/").pop()}</span></div>
                    <div>✨ Refined: <span className="text-white font-semibold">{metrics.selfReflectionPassed ? "No" : "Yes"}</span></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
