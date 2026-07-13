"use client";

import { useState, useEffect } from "react";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { SkeletonCard } from "@/components/Skeleton";

export default function GanttPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [showTasks, setShowTasks] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const projsRes = await fetch("/api/projects");
      if (!projsRes.ok) throw new Error("Failed to load projects");
      const projs = await projsRes.json();

      const allSprints: any[] = [];
      const allTasks: any[] = [];

      for (const p of projs) {
        const [sprintsRes, tasksRes] = await Promise.all([
          fetch(`/api/sprints/project/${p.id}`).catch(() => null),
          fetch(`/api/tasks?project=${p.id}`).catch(() => null),
        ]);

        if (sprintsRes && sprintsRes.ok) {
          const s = await sprintsRes.json();
          allSprints.push(...s);
        }
        if (tasksRes && tasksRes.ok) {
          const t = await tasksRes.json();
          allTasks.push(...t);
        }
      }

      // Format for gantt-task-react
      const list: Task[] = [];

      // Add projects
      projs.forEach((p: any) => {
        list.push({
          id: `proj-${p.id}`,
          name: `[Project] ${p.name}`,
          start: new Date(p.created_at || Date.now()),
          end: new Date(Date.now() + 86400000 * 30),
          type: "project",
          progress: 50,
          styles: { progressColor: "#8b5cf6", progressSelectedColor: "#7c3aed" },
        });
      });

      // Add sprints
      allSprints.forEach((s: any) => {
        list.push({
          id: `sprint-${s.id}`,
          name: `[Sprint] ${s.name}`,
          start: new Date(s.start_date || Date.now()),
          end: new Date(s.end_date || Date.now() + 86400000 * 14),
          type: "project",
          progress: s.status === "Completed" ? 100 : s.status === "Active" ? 50 : 0,
          project: `proj-${s.project_id}`,
          styles: { progressColor: "#3b82f6", progressSelectedColor: "#2563eb" },
        });
      });

      // Add tasks if toggled
      if (showTasks) {
        allTasks.forEach((t: any) => {
          list.push({
            id: `task-${t.id}`,
            name: t.title,
            start: new Date(t.created_at || Date.now()),
            end: new Date(t.due_date || Date.now() + 86400000 * 3),
            type: "task",
            progress: t.status === "Done" ? 100 : t.status === "In Progress" ? 50 : 0,
            project: t.sprint_id ? `sprint-${t.sprint_id}` : `proj-${t.project_id}`,
            styles: { progressColor: "#10b981", progressSelectedColor: "#059669" },
            dependencies: t.blocked_by ? [`task-${t.blocked_by}`] : undefined,
          });
        });
      }

      setTasks(list.length > 0 ? list : getFallbackGanttTasks());
    } catch (err) {
      console.error("Error formatting Gantt tasks:", err);
      setTasks(getFallbackGanttTasks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [showTasks]);

  function getFallbackGanttTasks(): Task[] {
    return [
      {
        id: "fallback-project",
        name: "Acme Sandbox Roadmap",
        start: new Date(),
        end: new Date(Date.now() + 86400000 * 30),
        type: "project",
        progress: 30,
        styles: { progressColor: "#8b5cf6", progressSelectedColor: "#7c3aed" },
      },
      {
        id: "fallback-sprint-1",
        name: "Sprint 1: Core Setup",
        start: new Date(),
        end: new Date(Date.now() + 86400000 * 14),
        type: "task",
        progress: 80,
        project: "fallback-project",
        styles: { progressColor: "#3b82f6", progressSelectedColor: "#2563eb" },
      }
    ];
  }

  const handleTaskReschedule = async (task: Task) => {
    try {
      const id = task.id.replace(/(proj-|sprint-|task-)/, "");
      const entity = task.id.startsWith("task-") ? "tasks" : task.id.startsWith("sprint-") ? "sprints" : "projects";
      
      const updateData: any = {};
      if (entity === "tasks" || entity === "projects") {
        updateData.dueDate = task.end.toISOString().slice(0, 10);
      } else if (entity === "sprints") {
        updateData.startDate = task.start.toISOString().slice(0, 10);
        updateData.endDate = task.end.toISOString().slice(0, 10);
      }

      await fetch(`/api/${entity}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
    } catch (err) {
      console.error("Gantt drag update failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold font-heading text-white">Roadmap</h1>
        <div className="grid grid-cols-1 gap-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-up">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Interactive Roadmaps</h1>
          <p className="text-slate-400 text-sm mt-1">Gantt scheduling showing workspace, sprints, and task dependencies.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Modes */}
          <div className="flex bg-white/5 border border-white/10 rounded-full p-0.5 text-xs">
            <button onClick={() => setViewMode(ViewMode.Day)} className={`px-4 py-1.5 rounded-full transition-all font-semibold font-heading ${viewMode === ViewMode.Day ? "bg-accent-purple text-white" : "text-slate-400 hover:text-white"}`}>Day</button>
            <button onClick={() => setViewMode(ViewMode.Week)} className={`px-4 py-1.5 rounded-full transition-all font-semibold font-heading ${viewMode === ViewMode.Week ? "bg-accent-purple text-white" : "text-slate-400 hover:text-white"}`}>Week</button>
            <button onClick={() => setViewMode(ViewMode.Month)} className={`px-4 py-1.5 rounded-full transition-all font-semibold font-heading ${viewMode === ViewMode.Month ? "bg-accent-purple text-white" : "text-slate-400 hover:text-white"}`}>Month</button>
          </div>

          {/* Toggle Tasks */}
          <label className="flex items-center gap-2 text-xs font-heading font-semibold text-slate-300 bg-white/5 border border-white/10 px-4 py-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors">
            <input
              type="checkbox"
              checked={showTasks}
              onChange={(e) => setShowTasks(e.target.checked)}
              className="rounded border-white/20 bg-transparent text-accent-purple focus:ring-0"
            />
            Show Tasks
          </label>
        </div>
      </div>

      {/* Gantt Canvas Container */}
      <div className="p-6 bg-white/[0.02] border border-white/10 rounded-[24px] backdrop-blur-[24px] overflow-x-auto">
        <div className="min-w-[800px] text-slate-900 bg-white rounded-xl p-4">
          <Gantt 
            tasks={tasks}
            viewMode={viewMode}
            onDateChange={handleTaskReschedule}
            listCellWidth="200px"
            columnWidth={viewMode === ViewMode.Day ? 60 : 70}
          />
        </div>
      </div>
    </div>
  );
}
