"use client";

import { useState, useEffect } from "react";
import { Mail, Check, AlertCircle, FileText, Plus, CheckCircle, EyeOff, Sparkles, Inbox, RefreshCw, User, Terminal, Calendar } from "lucide-react";

export default function TriagePage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Modal state
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [itemTypes, setItemTypes] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  
  // Convert Form fields
  const [targetProject, setTargetProject] = useState("");
  const [targetType, setTargetType] = useState("");
  const [targetSprint, setTargetSprint] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskPoints, setTaskPoints] = useState(1);
  const [taskDueDate, setTaskDueDate] = useState("");

  const loadTriage = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/triage");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        if (data.length > 0 && !selectedItem) {
          setSelectedItem(data[0]);
        }
      }

      // Preload projects and item types for the convert modal
      const [projRes, typeRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/work-item-types")
      ]);
      if (projRes.ok) {
        const p = await projRes.json();
        setProjects(p);
        if (p.length > 0) setTargetProject(p[0].id);
      }
      if (typeRes.ok) {
        const t = await typeRes.json();
        setItemTypes(t);
        if (t.length > 0) setTargetType(t[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTriage();
  }, []);

  // Update sprints when project changes
  useEffect(() => {
    if (targetProject) {
      fetch(`/api/sprints/project/${targetProject}`)
        .then(res => res.json())
        .then(data => {
          setSprints(data);
          if (data.length > 0) setTargetSprint(data[0].id);
          else setTargetSprint("");
        })
        .catch(console.error);
    }
  }, [targetProject]);

  const handleSimulate = async (type: string) => {
    let mockData = {
      title: "",
      description: "",
      source: "email",
      sender: ""
    };

    if (type === "bug") {
      mockData = {
        title: "CRITICAL: Zoom meeting link injection crashes workspace dashboard",
        description: "Steps to reproduce:\n1. Open meetings panel.\n2. Schedule a Zoom room with an empty topic.\n3. The landing dashboard throws a 500 error.\n\nBrowser: Chrome 124.0.0.0 (Windows 11).",
        source: "form",
        sender: "Aneeque Shahid (QA Team)"
      };
    } else if (type === "support") {
      mockData = {
        title: "Integration request: Connect Microsoft Teams for active sprints notifications",
        description: "Hi Pulse Support,\n\nWe need to sync our project boards with Microsoft Teams channel webhooks. Is this currently supported, or can we configure it via your automation layer?",
        source: "email",
        sender: "enterprise-client@acme.com"
      };
    } else {
      mockData = {
        title: "Guardrail Threshold Exceeded: High Latency Warning",
        description: "Observed response times on OpenRouter LLM requests exceeded 5000ms threshold for 5 consecutive invocations. Latency is now at 8421ms.",
        source: "api",
        sender: "pulse-guardrail-bot"
      };
    }

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockData)
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems(prev => [newItem, ...prev]);
        setSelectedItem(newItem);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIgnore = async (id: string) => {
    try {
      const res = await fetch("/api/triage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "ignored" })
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, status: "ignored" } : item));
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem({ ...selectedItem, status: "ignored" });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openConvertModal = () => {
    if (!selectedItem) return;
    setTaskTitle(selectedItem.title);
    setTaskDesc(selectedItem.description || "");
    setTaskDueDate(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)); // 3 days from now
    setIsConvertOpen(true);
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      // 1. Create task
      const taskRes = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: targetProject,
          sprint_id: targetSprint || null,
          title: taskTitle,
          description: taskDesc,
          priority: taskPriority,
          story_points: taskPoints,
          due_date: taskDueDate,
          work_item_type_id: targetType || null,
          status: "Todo"
        })
      });

      if (!taskRes.ok) throw new Error("Failed to create task");
      const createdTask = await taskRes.json();

      // 2. Update triage status
      const triageRes = await fetch("/api/triage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.id,
          status: "converted"
        })
      });

      if (triageRes.ok) {
        setItems(prev => prev.map(item => item.id === selectedItem.id ? { ...item, status: "converted" } : item));
        setSelectedItem({ ...selectedItem, status: "converted" });
        setIsConvertOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Triage Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">Inbox intake for incoming customer requests, support feedback, and automated api warnings.</p>
        </div>
        
        {/* Simulation utilities */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Simulate Intake:</span>
          <button
            onClick={() => handleSimulate("bug")}
            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-heading font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            🐛 Bug Form
          </button>
          <button
            onClick={() => handleSimulate("support")}
            className="px-3 py-1.5 bg-accent-blue/10 border border-accent-blue/20 hover:bg-accent-blue/20 text-accent-blue font-heading font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            📧 Support Email
          </button>
          <button
            onClick={() => handleSimulate("api")}
            className="px-3 py-1.5 bg-accent-purple/10 border border-accent-purple/20 hover:bg-accent-purple/20 text-accent-purple font-heading font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            ⚡ API Warning
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white/[0.01] border border-white/10 rounded-[28px] text-center space-y-4">
          <Inbox className="text-slate-600" size={48} />
          <h3 className="text-lg font-bold font-heading text-white">Your Triage Inbox is clean</h3>
          <p className="text-xs text-slate-400 max-w-sm">Use the Simulation buttons at the top right to generate incoming requests and test the conversion flow.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Intake list */}
          <div className="lg:col-span-1 p-6 bg-white/[0.02] border border-white/10 rounded-[28px] backdrop-blur-[24px] space-y-4 max-h-[600px] overflow-y-auto">
            <h2 className="text-base font-bold font-heading text-white">Inbox Feed</h2>
            <div className="space-y-3">
              {items.map((item) => {
                const isSelected = selectedItem && selectedItem.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2 ${
                      isSelected 
                        ? "bg-white/5 border-accent-purple/40 shadow-lg shadow-accent-purple/5" 
                        : "bg-white/[0.01] border-white/5 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                        item.source === "api" ? "bg-accent-purple/10 border border-accent-purple/20 text-accent-purple" :
                        item.source === "form" ? "bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald" :
                        "bg-accent-blue/10 border border-accent-blue/20 text-accent-blue"
                      }`}>
                        {item.source}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white font-heading truncate w-full">{item.title}</h4>
                    <p className="text-[10px] text-slate-400 truncate w-full">{item.sender}</p>

                    <div className="flex justify-between items-center w-full pt-1 border-t border-white/5 mt-1">
                      <span className={`text-[9px] font-semibold ${
                        item.status === "converted" ? "text-accent-emerald flex items-center gap-0.5" :
                        item.status === "ignored" ? "text-slate-500" : "text-amber-400 font-bold"
                      }`}>
                        {item.status === "converted" ? "✓ Converted" : item.status === "ignored" ? "Ignored" : "● Action Required"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Intake item details */}
          <div className="lg:col-span-2 p-8 bg-white/[0.02] border border-white/10 rounded-[28px] backdrop-blur-[24px] space-y-6">
            {selectedItem ? (
              <div className="space-y-6 animate-slide-up">
                {/* Meta details */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-accent-purple">Request Submitter</span>
                    <h3 className="text-lg font-bold text-white font-heading">{selectedItem.sender}</h3>
                    <p className="text-xs text-slate-400">{new Date(selectedItem.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                      selectedItem.source === "api" ? "bg-accent-purple/10 border-accent-purple/20 text-accent-purple" :
                      selectedItem.source === "form" ? "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald" :
                      "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"
                    }`}>
                      {selectedItem.source} Source
                    </span>
                  </div>
                </div>

                {/* Request Content */}
                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-heading text-white">{selectedItem.title}</h2>
                  <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedItem.description || "No additional description provided."}
                  </div>
                </div>

                {/* Actions bar */}
                {selectedItem.status === "new" ? (
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={openConvertModal}
                      className="px-5 py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue hover:opacity-95 text-white font-heading font-bold text-xs rounded-xl shadow-lg shadow-accent-purple/10 flex items-center gap-1.5 transition-opacity cursor-pointer animate-pulse"
                    >
                      <Plus size={15} /> Convert to Live Task
                    </button>
                    <button
                      onClick={() => handleIgnore(selectedItem.id)}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-heading font-bold text-xs rounded-xl border border-white/5 transition-colors cursor-pointer"
                    >
                      Ignore Request
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-2 text-xs font-heading">
                    {selectedItem.status === "converted" ? (
                      <>
                        <CheckCircle size={16} className="text-accent-emerald" />
                        <span className="text-slate-300 font-bold">This request was successfully converted to a task.</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={16} className="text-slate-500" />
                        <span className="text-slate-400">This request was ignored and archived.</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-heading">
                Select a triage item from the sidebar feed to action.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Convert to Task Modal */}
      {isConvertOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-dark border border-white/10 rounded-[28px] max-w-lg w-full p-8 space-y-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-heading text-white">Convert to Pulse Task</h3>
                <p className="text-xs text-slate-400">Define project delivery specifications for this ticket.</p>
              </div>
              <button
                onClick={() => setIsConvertOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConvert} className="space-y-4">
              {/* Title & Description */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Task Title</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-accent-purple/50 text-white"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Description</label>
                  <textarea
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-accent-purple/50 text-white min-h-[80px]"
                  />
                </div>
              </div>

              {/* Select Project & Work Item Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Target Project</label>
                  <select
                    value={targetProject}
                    onChange={(e) => setTargetProject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-white cursor-pointer"
                  >
                    {projects.map(p => (
                      <option key={p.id} className="bg-bg-dark" value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Work Item Type</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-white cursor-pointer"
                  >
                    {itemTypes.map(t => (
                      <option key={t.id} className="bg-bg-dark" value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sprint & Assignee / Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Sprint Target</label>
                  <select
                    value={targetSprint}
                    onChange={(e) => setTargetSprint(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-white cursor-pointer"
                  >
                    <option className="bg-bg-dark" value="">Backlog (No Sprint)</option>
                    {sprints.map(s => (
                      <option key={s.id} className="bg-bg-dark" value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-white cursor-pointer"
                  >
                    <option className="bg-bg-dark" value="Low">Low</option>
                    <option className="bg-bg-dark" value="Medium">Medium</option>
                    <option className="bg-bg-dark" value="High">High</option>
                    <option className="bg-bg-dark" value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Points & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Story Points</label>
                  <input
                    type="number"
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-accent-purple/50 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-accent-purple/50 text-white cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue hover:opacity-95 text-white font-heading font-bold text-xs rounded-xl shadow-lg shadow-accent-purple/10 flex items-center justify-center gap-1.5 transition-opacity cursor-pointer mt-4"
              >
                <Check size={15} /> Confirm Conversion
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
