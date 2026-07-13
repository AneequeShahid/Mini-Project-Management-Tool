"use client";

import { useState, useEffect } from "react";
import CalendarView from "@/components/CalendarView";

export default function CalendarPage() {
  const [sprints, setSprints] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [externalEvents, setExternalEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch projects
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

      setSprints(allSprints);
      setTasks(allTasks);

      // Fetch external calendar events
      const eventsRes = await fetch("/api/integrations/calendar/events");
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        setExternalEvents(events);
      }
    } catch (err) {
      console.error("Error loading calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskReschedule = async (taskId: string, newDate: Date) => {
    try {
      const formattedDate = newDate.toISOString().slice(0, 10);
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: formattedDate }),
      });
      if (!res.ok) throw new Error("Update failed");
      
      // Update local state
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, due_date: formattedDate } : t));
    } catch (err) {
      console.error("Reschedule failed:", err);
      loadData(); // reload on error
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
    <div className="space-y-6 max-w-7xl mx-auto animate-slide-up">
      <div>
        <h1 className="text-4xl font-bold font-heading text-white tracking-tight leading-tight">Calendar Workspace</h1>
        <p className="text-slate-400 text-sm mt-1">Unified calendar overlays showing sprints, tasks, and Google Calendar events.</p>
      </div>

      <CalendarView 
        sprints={sprints} 
        tasks={tasks} 
        externalEvents={externalEvents} 
        onTaskReschedule={handleTaskReschedule} 
      />
    </div>
  );
}
