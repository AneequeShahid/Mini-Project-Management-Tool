"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";

interface CalendarViewProps {
  sprints?: any[];
  tasks?: any[];
  externalEvents?: any[];
  onDayClick?: (day: Date) => void;
  onTaskReschedule?: (taskId: string, newDate: Date) => Promise<void>;
}

export default function CalendarView({ sprints = [], tasks = [], externalEvents = [], onDayClick, onTaskReschedule }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  const days = useMemo(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    }
    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate, view]);

  const sprintRanges = useMemo(() => {
    return sprints.map((s) => ({ ...s, start: new Date(s.startDate || s.start_date), end: new Date(s.endDate || s.end_date) }));
  }, [sprints]);

  const navigate = (dir: number) => {
    if (view === "month") setCurrentDate(dir < 0 ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    else setCurrentDate(dir < 0 ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent, day: Date) => { e.preventDefault(); setDragOverDate(day.toISOString().slice(0, 10)); };
  const handleDrop = (e: React.DragEvent, day: Date) => {
    e.preventDefault(); setDragOverDate(null);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId && onTaskReschedule) onTaskReschedule(taskId, day);
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* Header controls */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">&larr;</button>
          <h2 className="font-heading font-bold text-white text-lg min-w-[150px] text-center">
            {view === "month" ? format(currentDate, "MMMM yyyy") : `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`}
          </h2>
          <button onClick={() => navigate(1)} className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors">&rarr;</button>
        </div>
        <div className="flex bg-white/5 border border-white/10 rounded-full p-0.5 text-xs">
          <button onClick={() => setView("month")} className={`px-4 py-1.5 rounded-full transition-all font-semibold font-heading ${view === "month" ? "bg-accent-purple text-white" : "text-slate-400 hover:text-white"}`}>Month</button>
          <button onClick={() => setView("week")} className={`px-4 py-1.5 rounded-full transition-all font-semibold font-heading ${view === "week" ? "bg-accent-purple text-white" : "text-slate-400 hover:text-white"}`}>Week</button>
        </div>
      </div>

      {/* Weekday Names */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 border-b border-white/10 bg-white/[0.01] py-2 font-heading">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 bg-white/[0.01]">
        {days.map((day) => {
          const daySprints = sprintRanges.filter((s) => day >= s.start && day <= s.end);
          const dayTasks = tasks.filter((t) => (t.dueDate || t.due_date) && isSameDay(new Date(t.dueDate || t.due_date), day));
          const dayEvents = externalEvents.filter((e) => e.startTime && isSameDay(new Date(e.startTime), day));
          const isCurrent = view === "month" ? isSameMonth(day, currentDate) : true;
          const isToday = isSameDay(day, new Date());
          const isDragOver = dragOverDate === day.toISOString().slice(0, 10);

          return (
            <div 
              key={day.toISOString()} 
              onDragOver={(e) => handleDragOver(e, day)} 
              onDragLeave={() => setDragOverDate(null)}
              onDrop={(e) => handleDrop(e, day)} 
              onClick={() => onDayClick?.(day)}
              className={`min-h-[110px] p-2 border-b border-r border-white/10 text-xs cursor-pointer transition-colors relative flex flex-col justify-between ${
                !isCurrent ? "text-slate-600 opacity-40" : "text-slate-200"
              } ${isToday ? "bg-accent-blue/5" : ""} ${
                isDragOver ? "bg-accent-purple/10 ring-1 ring-accent-purple/30" : "hover:bg-white/[0.02]"
              }`}
            >
              {/* Day Number */}
              <div className="flex justify-between items-start">
                <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold font-heading ${isToday ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/40" : "text-slate-300"}`}>
                  {format(day, "d")}
                </span>
              </div>

              {/* Items Area */}
              <div className="flex-1 mt-2 space-y-1 overflow-hidden flex flex-col justify-end">
                {daySprints.slice(0, view === "week" ? 3 : 1).map((s) => (
                  <div key={s.id || s._id} className={`text-[9px] truncate rounded px-2 py-0.5 font-semibold font-heading border ${s.status === "Active" ? "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald" : "bg-accent-blue/10 border-accent-blue/20 text-accent-blue"}`}>
                    {s.name}
                  </div>
                ))}
                {dayTasks.slice(0, view === "week" ? 4 : 1).map((t) => (
                  <div 
                    key={t.id || t._id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, t.id || t._id)}
                    className="text-[9px] truncate rounded px-2 py-0.5 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple font-medium cursor-grab active:cursor-grabbing hover:bg-accent-purple/20 transition-all font-heading"
                  >
                    {t.title}
                  </div>
                ))}
                {dayEvents.slice(0, view === "week" ? 4 : 1).map((e) => (
                  <div key={e.id} className="text-[9px] truncate rounded px-2 py-0.5 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan font-medium hover:bg-accent-cyan/20 transition-all font-heading" title={e.title}>
                    📅 {e.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
