"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { 
  Sparkles, Filter, Kanban as KanbanIcon, List as ListIcon, Calendar as CalendarIcon, 
  GanttChartSquare, Save, Plus, ArrowUpDown, ChevronDown, Check, LayoutGrid, User, Clock, 
  Trash2, X, FileText, CheckSquare, Award, BookOpen, AlertCircle, Tag, Settings, SaveAll, Bug
} from "lucide-react";
import CalendarView from "@/components/CalendarView";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";

// Dynamically import TipTap Rich Text Editor to prevent SSR issues
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });

export default function ViewsEnginePageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: '#52525b' }}>Loading views...</div>}>
      <ViewsEnginePage />
    </Suspense>
  );
}

function ViewsEnginePage() {
  const searchParams = useSearchParams();
  // Config & Definitions
  const [projects, setProjects] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [itemTypes, setItemTypes] = useState<any[]>([]);
  const [customFieldsDef, setCustomFieldsDef] = useState<any[]>([]);
  const [savedViews, setSavedViews] = useState<any[]>([]);
  
  // Data State
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Query Builder Parameters
  const [selectedProject, setSelectedProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [groupBy, setGroupBy] = useState("status"); // status, priority, work_item_type
  const [sortBy, setSortBy] = useState("due_date"); // due_date, story_points, created_at
  const [layoutMode, setLayoutMode] = useState<"Kanban" | "List" | "Gantt" | "Calendar">("Kanban");
  
  // Modals & Panels
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  
  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskProject, setNewTaskProject] = useState("");
  const [newTaskSprint, setNewTaskSprint] = useState("");
  const [newTaskType, setNewTaskType] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("Medium");
  const [newTaskPoints, setNewTaskPoints] = useState(1);
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  
  // Edit Task State
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("");
  const [editTaskStatus, setEditTaskStatus] = useState("");
  const [editTaskPoints, setEditTaskPoints] = useState(0);
  const [editTaskDueDate, setEditTaskDueDate] = useState("");
  const [editTaskType, setEditTaskType] = useState("");
  const [editTaskSprint, setEditTaskSprint] = useState("");
  const [editTaskCustomFields, setEditTaskCustomFields] = useState<Record<string, any>>({});

  const iconsList: Record<string, any> = {
    tag: Tag,
    "book-open": BookOpen,
    bug: Bug,
    "check-square": CheckSquare,
    award: Award,
    "alert-circle": AlertCircle
  };

  const loadBaseConfig = async () => {
    try {
      const [projRes, typeRes, cfRes, viewsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/work-item-types"),
        fetch("/api/custom-fields"),
        fetch("/api/views")
      ]);

      if (projRes.ok) {
        const p = await projRes.json();
        setProjects(p);
        if (p.length > 0) {
          setSelectedProject(p[0].id);
          setNewTaskProject(p[0].id);
        }
      }
      if (typeRes.ok) {
        const t = await typeRes.json();
        setItemTypes(t);
        if (t.length > 0) setNewTaskType(t[0].id);
      }
      if (cfRes.ok) {
        const c = await cfRes.json();
        setCustomFieldsDef(c);
      }
      if (viewsRes.ok) {
        const v = await viewsRes.json();
        setSavedViews(v);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTasks = async () => {
    if (!selectedProject) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?project=${selectedProject}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Preload projects etc on start
  useEffect(() => {
    loadBaseConfig();
  }, []);

  useEffect(() => {
    if (searchParams.get("createTask") === "1") setIsNewTaskOpen(true);
  }, [searchParams]);

  // Reload tasks when selected project changes
  useEffect(() => {
    loadTasks();
    if (selectedProject) {
      fetch(`/api/sprints/project/${selectedProject}`)
        .then(res => res.json())
        .then(data => {
          setSprints(data);
          if (data.length > 0) setNewTaskSprint(data[0].id);
          else setNewTaskSprint("");
        })
        .catch(console.error);
    }
  }, [selectedProject]);

  // Load target task details in sidebar
  const handleSelectTask = async (task: any) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`);
      if (res.ok) {
        const fullTask = await res.json();
        setSelectedTask(fullTask);
        setEditTaskTitle(fullTask.title);
        setEditTaskDesc(fullTask.description || "");
        setEditTaskPriority(fullTask.priority);
        setEditTaskStatus(fullTask.status);
        setEditTaskPoints(fullTask.story_points || 0);
        setEditTaskDueDate(fullTask.due_date ? fullTask.due_date.slice(0, 10) : "");
        setEditTaskType(fullTask.work_item_type_id || "");
        setEditTaskSprint(fullTask.sprint_id || "");
        setEditTaskCustomFields(fullTask.custom_fields || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save changes to current task
  const handleUpdateTaskField = async (updatedFields: any) => {
    if (!selectedTask) return;
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, ...updated } : t));
        if (selectedTask) {
          setSelectedTask({ ...selectedTask, ...updated });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCustomField = async (cfId: string, val: any) => {
    const updatedCf = { ...editTaskCustomFields, [cfId]: val };
    setEditTaskCustomFields(updatedCf);
    await handleUpdateTaskField({ custom_fields: updatedCf });
  };

  const handleSaveDocContent = async (html: string) => {
    await handleUpdateTaskField({ document_content: html });
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: newTaskProject,
          sprint_id: newTaskSprint || null,
          title: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority,
          story_points: newTaskPoints,
          due_date: newTaskDueDate || null,
          work_item_type_id: newTaskType || null,
          status: "Todo"
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(prev => [...prev, data]);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setIsNewTaskOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
        setSelectedTask(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveView = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViewName.trim() || !selectedProject) return;

    try {
      const res = await fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newViewName,
          type: layoutMode,
          query: {
            filterStatus,
            filterPriority,
            filterType,
            groupBy,
            sortBy,
            selectedProject
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedViews(prev => [...prev, data]);
        setNewViewName("");
        setIsSaveViewOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadView = (view: any) => {
    if (view.query) {
      const q = view.query;
      if (q.selectedProject) setSelectedProject(q.selectedProject);
      if (q.filterStatus) setFilterStatus(q.filterStatus);
      if (q.filterPriority) setFilterPriority(q.filterPriority);
      if (q.filterType) setFilterType(q.filterType);
      if (q.groupBy) setGroupBy(q.groupBy);
      if (q.sortBy) setSortBy(q.sortBy);
    }
    if (view.type) setLayoutMode(view.type);
  };

  // Filter and Sort Tasks
  const getProcessedTasks = () => {
    let list = [...tasks];
    
    // Status filter
    if (filterStatus !== "all") {
      list = list.filter(t => t.status === filterStatus);
    }
    // Priority filter
    if (filterPriority !== "all") {
      list = list.filter(t => t.priority === filterPriority);
    }
    // Work Item Type filter
    if (filterType !== "all") {
      list = list.filter(t => t.work_item_type_id === filterType);
    }

    // Sort Tasks
    list.sort((a, b) => {
      if (sortBy === "due_date") {
        const da = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const db = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        return da - db;
      }
      if (sortBy === "story_points") {
        return (b.story_points || 0) - (a.story_points || 0);
      }
      if (sortBy === "created_at") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

    return list;
  };

  const processedTasks = getProcessedTasks();

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-[calc(100vh-8rem)] relative select-none animate-slide-up">
      {/* Header bar / Query Builder */}
      <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/10 p-5 rounded-[24px] backdrop-blur-[24px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent-purple" />
            <h1 className="text-2xl font-bold font-heading text-white tracking-tight">Pulse Views Engine</h1>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Saved Views Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 font-heading font-semibold text-xs border border-white/10 rounded-xl cursor-pointer">
                <SaveAll size={13} /> Saved Views <ChevronDown size={12} />
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-bg-dark border border-white/10 rounded-xl py-1.5 w-48 shadow-2xl z-40">
                {savedViews.length === 0 ? (
                  <span className="text-[10px] text-slate-500 px-3 py-1.5 block">No saved views</span>
                ) : (
                  savedViews.map(v => (
                    <button
                      key={v.id}
                      onClick={() => handleLoadView(v)}
                      className="w-full text-left px-3.5 py-1.5 hover:bg-white/5 text-[11px] font-heading font-semibold text-slate-300 hover:text-white"
                    >
                      {v.name} ({v.type})
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Save Current View */}
            <button
              onClick={() => setIsSaveViewOpen(true)}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white font-heading font-semibold text-xs border border-white/10 rounded-xl cursor-pointer"
            >
              <Save size={13} /> Save View
            </button>

            {/* Add Task */}
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-accent-purple to-accent-blue text-white font-heading font-bold text-xs rounded-xl shadow-lg shadow-accent-purple/10 cursor-pointer hover:opacity-95"
            >
              <Plus size={14} /> Add Task
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-3 border-t border-white/5 text-xs">
          {/* Project SELECT */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Project</span>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-xl px-2 py-1.5 outline-none font-semibold font-heading cursor-pointer text-white"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-bg-dark">{p.name}</option>
              ))}
            </select>
          </div>

          {/* Status FILTER */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-xl px-2 py-1.5 outline-none font-semibold font-heading cursor-pointer text-white"
            >
              <option value="all" className="bg-bg-dark">All Statuses</option>
              <option value="Backlog" className="bg-bg-dark">Backlog</option>
              <option value="Todo" className="bg-bg-dark">Todo</option>
              <option value="In Progress" className="bg-bg-dark">In Progress</option>
              <option value="In Review" className="bg-bg-dark">In Review</option>
              <option value="Done" className="bg-bg-dark">Done</option>
            </select>
          </div>

          {/* Priority FILTER */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Priority</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-xl px-2 py-1.5 outline-none font-semibold font-heading cursor-pointer text-white"
            >
              <option value="all" className="bg-bg-dark">All Priorities</option>
              <option value="Low" className="bg-bg-dark">Low</option>
              <option value="Medium" className="bg-bg-dark">Medium</option>
              <option value="High" className="bg-bg-dark">High</option>
              <option value="Critical" className="bg-bg-dark">Critical</option>
            </select>
          </div>

          {/* Type FILTER */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Item Type</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-xl px-2 py-1.5 outline-none font-semibold font-heading cursor-pointer text-white"
            >
              <option value="all" className="bg-bg-dark">All Types</option>
              {itemTypes.map(t => (
                <option key={t.id} value={t.id} className="bg-bg-dark">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Group By */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Group By</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-xl px-2 py-1.5 outline-none font-semibold font-heading cursor-pointer text-white"
            >
              <option value="status" className="bg-bg-dark">Status</option>
              <option value="priority" className="bg-bg-dark">Priority</option>
              <option value="work_item_type" className="bg-bg-dark">Work Item Type</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-xl px-2 py-1.5 outline-none font-semibold font-heading cursor-pointer text-white"
            >
              <option value="due_date" className="bg-bg-dark">Due Date</option>
              <option value="story_points" className="bg-bg-dark">Story Points</option>
              <option value="created_at" className="bg-bg-dark">Created Date</option>
            </select>
          </div>
        </div>

        {/* Layout Modes Tabs */}
        <div className="flex justify-between items-center pt-3 border-t border-white/5">
          <div className="flex bg-white/5 border border-white/10 rounded-full p-0.5 text-[11px] font-heading font-semibold">
            <button
              onClick={() => setLayoutMode("Kanban")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${layoutMode === "Kanban" ? "bg-accent-purple text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              <KanbanIcon size={12} /> Kanban Board
            </button>
            <button
              onClick={() => setLayoutMode("List")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${layoutMode === "List" ? "bg-accent-purple text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              <ListIcon size={12} /> List View
            </button>
            <button
              onClick={() => setLayoutMode("Gantt")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${layoutMode === "Gantt" ? "bg-accent-purple text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              <GanttChartSquare size={12} /> Gantt Roadmap
            </button>
            <button
              onClick={() => setLayoutMode("Calendar")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${layoutMode === "Calendar" ? "bg-accent-purple text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              <CalendarIcon size={12} /> Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Main rendering panels grid */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Left Board Area */}
        <div className="flex-1 bg-white/[0.01] border border-white/10 rounded-[28px] overflow-hidden p-6 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : processedTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-heading">
              No tasks match your filter criteria.
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {/* layout = KANBAN */}
              {layoutMode === "Kanban" && (
                <div className="flex gap-4 h-full min-w-[700px] overflow-x-auto pr-2">
                  {/* Grouped Columns */}
                  {(() => {
                    let groups: string[] = [];
                    if (groupBy === "status") {
                      groups = ["Backlog", "Todo", "In Progress", "In Review", "Done"];
                    } else if (groupBy === "priority") {
                      groups = ["Low", "Medium", "High", "Critical"];
                    } else if (groupBy === "work_item_type") {
                      groups = itemTypes.map(t => t.name);
                    }

                    return groups.map(groupName => {
                      const groupTasks = processedTasks.filter(t => {
                        if (groupBy === "status") return t.status === groupName;
                        if (groupBy === "priority") return t.priority === groupName;
                        if (groupBy === "work_item_type") {
                          const typeObj = itemTypes.find(type => type.id === t.work_item_type_id);
                          return (typeObj?.name || "") === groupName;
                        }
                        return false;
                      });

                      return (
                        <div key={groupName} className="flex-1 min-w-[220px] bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-white font-heading">{groupName}</span>
                            <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] font-mono text-slate-400 rounded">{groupTasks.length}</span>
                          </div>
                          
                          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                            {groupTasks.map(task => {
                              const typeObj = itemTypes.find(t => t.id === task.work_item_type_id);
                              const TypeIcon = typeObj ? (iconsList[typeObj.icon] || Tag) : Tag;
                              return (
                                <button
                                  key={task.id}
                                  onClick={() => handleSelectTask(task)}
                                  className="w-full text-left p-3.5 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-xl transition-all flex flex-col gap-2 hover:bg-white/[0.02] cursor-pointer"
                                >
                                  {typeObj && (
                                    <div className="flex items-center gap-1 text-[9px] font-bold tracking-wider font-heading uppercase" style={{ color: typeObj.color }}>
                                      <TypeIcon size={10} /> {typeObj.name}
                                    </div>
                                  )}
                                  <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                                  <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[9px] font-mono text-slate-500 w-full">
                                    <span className={`px-1.5 py-0.5 rounded ${
                                      task.priority === "Critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                      task.priority === "High" ? "bg-amber-500/10 text-amber-400" :
                                      "bg-white/5 text-slate-400"
                                    }`}>
                                      {task.priority}
                                    </span>
                                    <span>{task.due_date ? task.due_date.slice(0, 10) : "No due date"}</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* layout = LIST */}
              {layoutMode === "List" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-mono font-bold">
                        <th className="pb-3 pr-4">Work Item Type</th>
                        <th className="pb-3 pr-4">Task Name</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Priority</th>
                        <th className="pb-3 pr-4">Story Points</th>
                        <th className="pb-3 pr-4">Due Date</th>
                        {customFieldsDef.map(f => (
                          <th key={f.id} className="pb-3 pr-4">{f.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300 font-heading">
                      {processedTasks.map(t => {
                        const typeObj = itemTypes.find(type => type.id === t.work_item_type_id);
                        const TypeIcon = typeObj ? (iconsList[typeObj.icon] || Tag) : Tag;
                        return (
                          <tr
                            key={t.id}
                            onClick={() => handleSelectTask(t)}
                            className="hover:bg-white/[0.02] cursor-pointer group transition-colors"
                          >
                            <td className="py-3.5 pr-4">
                              {typeObj ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border border-transparent" style={{ backgroundColor: `${typeObj.color}15`, color: typeObj.color }}>
                                  <TypeIcon size={10} /> {typeObj.name}
                                </span>
                              ) : (
                                <span className="text-slate-500">Unclassified</span>
                              )}
                            </td>
                            <td className="py-3.5 pr-4 font-bold text-white group-hover:text-accent-purple transition-colors">{t.title}</td>
                            <td className="py-3.5 pr-4">
                              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 font-mono text-[9px]">{t.status}</span>
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                t.priority === "Critical" ? "bg-red-500/10 text-red-400" :
                                t.priority === "High" ? "bg-amber-500/10 text-amber-400" :
                                "bg-white/5 text-slate-400"
                              }`}>{t.priority}</span>
                            </td>
                            <td className="py-3.5 pr-4 font-mono font-bold text-white">{t.story_points || 0}</td>
                            <td className="py-3.5 pr-4 text-slate-400 font-mono">{t.due_date ? t.due_date.slice(0, 10) : "-"}</td>
                            {customFieldsDef.map(f => {
                              const val = t.custom_fields?.[f.id];
                              return (
                                <td key={f.id} className="py-3.5 pr-4 text-slate-400 italic">
                                  {val !== undefined ? String(val) : "-"}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* layout = GANTT */}
              {layoutMode === "Gantt" && (
                <div className="min-w-[700px] bg-white rounded-2xl p-4 text-slate-900 overflow-x-auto">
                  <Gantt
                    viewMode={ViewMode.Week}
                    listCellWidth="150px"
                    tasks={processedTasks.map(t => ({
                      id: t.id,
                      name: t.title,
                      start: new Date(t.created_at || Date.now()),
                      end: new Date(t.due_date || Date.now() + 86400000 * 2),
                      type: "task",
                      progress: t.status === "Done" ? 100 : t.status === "In Progress" ? 50 : 0,
                      styles: { progressColor: "#8b5cf6", progressSelectedColor: "#7c3aed" }
                    }))}
                  />
                </div>
              )}

              {/* layout = CALENDAR */}
              {layoutMode === "Calendar" && (
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                  <CalendarView
                    sprints={sprints}
                    tasks={processedTasks}
                    externalEvents={[]}
                    onTaskReschedule={async (taskId, newDate) => {
                      const formattedDate = newDate.toISOString().slice(0, 10);
                      const res = await fetch(`/api/tasks/${taskId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ due_date: formattedDate })
                      });
                      if (res.ok) {
                        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, due_date: formattedDate } : t));
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar Details Editor */}
        {selectedTask && (
          <div className="w-[380px] bg-white/[0.02] border border-white/10 rounded-[28px] p-6 flex flex-col gap-6 overflow-y-auto shrink-0 animate-slide-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Task Specification</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
                >
                  <Trash2 size={13} />
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Standard inputs */}
            <div className="space-y-4 text-xs font-heading">
              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Title</label>
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  onBlur={() => handleUpdateTaskField({ title: editTaskTitle })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 outline-none focus:border-accent-purple/50 font-bold text-white"
                />
              </div>

              {/* Description input */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Brief Overview</label>
                <textarea
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                  onBlur={() => handleUpdateTaskField({ description: editTaskDesc })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 outline-none focus:border-accent-purple/50 text-slate-300 min-h-[60px]"
                />
              </div>

              {/* Status / Priority selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Status</label>
                  <select
                    value={editTaskStatus}
                    onChange={(e) => {
                      setEditTaskStatus(e.target.value);
                      handleUpdateTaskField({ status: e.target.value });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 outline-none text-white cursor-pointer"
                  >
                    <option className="bg-bg-dark" value="Backlog">Backlog</option>
                    <option className="bg-bg-dark" value="Todo">Todo</option>
                    <option className="bg-bg-dark" value="In Progress">In Progress</option>
                    <option className="bg-bg-dark" value="In Review">In Review</option>
                    <option className="bg-bg-dark" value="Done">Done</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Priority</label>
                  <select
                    value={editTaskPriority}
                    onChange={(e) => {
                      setEditTaskPriority(e.target.value);
                      handleUpdateTaskField({ priority: e.target.value });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 outline-none text-white cursor-pointer"
                  >
                    <option className="bg-bg-dark" value="Low">Low</option>
                    <option className="bg-bg-dark" value="Medium">Medium</option>
                    <option className="bg-bg-dark" value="High">High</option>
                    <option className="bg-bg-dark" value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Points / Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Story Points</label>
                  <input
                    type="number"
                    value={editTaskPoints}
                    onChange={(e) => setEditTaskPoints(parseInt(e.target.value) || 0)}
                    onBlur={() => handleUpdateTaskField({ story_points: editTaskPoints })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 outline-none focus:border-accent-purple/50 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Due Date</label>
                  <input
                    type="date"
                    value={editTaskDueDate}
                    onChange={(e) => {
                      setEditTaskDueDate(e.target.value);
                      handleUpdateTaskField({ due_date: e.target.value || null });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 outline-none focus:border-accent-purple/50 text-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Work Item Type Selector */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Work Item Type</label>
                <select
                  value={editTaskType}
                  onChange={(e) => {
                    setEditTaskType(e.target.value);
                    handleUpdateTaskField({ work_item_type_id: e.target.value || null });
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 outline-none text-white cursor-pointer"
                >
                  <option className="bg-bg-dark" value="">Unclassified</option>
                  {itemTypes.map(t => (
                    <option key={t.id} className="bg-bg-dark" value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom fields inputs */}
            {customFieldsDef.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5 text-xs font-heading">
                <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">Custom Fields Metadata</span>
                {customFieldsDef.map(f => {
                  const val = editTaskCustomFields[f.id] || "";
                  return (
                    <div key={f.id} className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">{f.name}</label>
                      {f.type === "select" ? (
                        <select
                          value={val}
                          onChange={(e) => handleUpdateCustomField(f.id, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 outline-none text-white cursor-pointer"
                        >
                          <option className="bg-bg-dark" value="">Select Option...</option>
                          {f.options.map((opt: string) => (
                            <option key={opt} className="bg-bg-dark" value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : f.type === "boolean" ? (
                        <label className="flex items-center gap-2 cursor-pointer p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/[0.08] transition-all">
                          <input
                            type="checkbox"
                            checked={!!val}
                            onChange={(e) => handleUpdateCustomField(f.id, e.target.checked)}
                            className="rounded border-white/20 bg-transparent text-accent-purple focus:ring-0"
                          />
                          <span className="text-slate-300">Enabled</span>
                        </label>
                      ) : f.type === "number" ? (
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => handleUpdateCustomField(f.id, parseFloat(e.target.value) || 0)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 outline-none focus:border-accent-purple/50 text-white font-mono"
                        />
                      ) : f.type === "date" ? (
                        <input
                          type="date"
                          value={val}
                          onChange={(e) => handleUpdateCustomField(f.id, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 outline-none focus:border-accent-purple/50 text-white cursor-pointer"
                        />
                      ) : (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleUpdateCustomField(f.id, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 outline-none focus:border-accent-purple/50 text-white"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Living Document TipTap Editor */}
            <div className="pt-4 border-t border-white/5 space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold block">Living Documentation Specs</span>
              <RichTextEditor
                taskId={selectedTask.id}
                initialContent={selectedTask.document_content || ""}
                onSave={handleSaveDocContent}
              />
            </div>
          </div>
        )}
      </div>

      {/* Save View Modal */}
      {isSaveViewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-dark border border-white/10 rounded-[28px] max-w-sm w-full p-8 space-y-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-heading text-white">Save Current View</h3>
                <p className="text-xs text-slate-400">Save current filters, layout & groupings.</p>
              </div>
              <button
                onClick={() => setIsSaveViewOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveView} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">View Name</label>
                <input
                  type="text"
                  placeholder="e.g. Critical Backend Bugs"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-accent-purple/50 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue hover:opacity-95 text-white font-heading font-bold text-xs rounded-xl shadow-lg shadow-accent-purple/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-4"
              >
                <Check size={15} /> Confirm Save
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-dark border border-white/10 rounded-[28px] max-w-md w-full p-8 space-y-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-heading text-white">Create Workspace Task</h3>
                <p className="text-xs text-slate-400">Define general parameters for this task.</p>
              </div>
              <button
                onClick={() => setIsNewTaskOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Title</label>
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-accent-purple/50 text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Overview description</label>
                <textarea
                  placeholder="Outline context..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-accent-purple/50 text-white min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Sprint Target</label>
                  <select
                    value={newTaskSprint}
                    onChange={(e) => setNewTaskSprint(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-white cursor-pointer"
                  >
                    <option className="bg-bg-dark" value="">Backlog (No Sprint)</option>
                    {sprints.map(s => (
                      <option key={s.id} className="bg-bg-dark" value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Work Item Type</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-white cursor-pointer"
                  >
                    {itemTypes.map(t => (
                      <option key={t.id} className="bg-bg-dark" value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold outline-none text-white cursor-pointer"
                  >
                    <option className="bg-bg-dark" value="Low">Low</option>
                    <option className="bg-bg-dark" value="Medium">Medium</option>
                    <option className="bg-bg-dark" value="High">High</option>
                    <option className="bg-bg-dark" value="Critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Story Points</label>
                  <input
                    type="number"
                    value={newTaskPoints}
                    onChange={(e) => setNewTaskPoints(parseInt(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-accent-purple/50 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-semibold outline-none focus:border-accent-purple/50 text-white cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-accent-purple to-accent-blue hover:opacity-95 text-white font-heading font-bold text-xs rounded-xl shadow-lg shadow-accent-purple/10 flex items-center justify-center gap-1.5 transition-opacity cursor-pointer mt-4"
              >
                <Check size={15} /> Confirm Create
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
