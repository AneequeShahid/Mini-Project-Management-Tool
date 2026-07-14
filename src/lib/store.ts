"use client";

import { create } from "zustand";
import { CALENDAR_EVENTS, INTEGRATIONS, TASKS } from "@/lib/data";

type WorkspaceStore = {
  tasks: typeof TASKS;
  integrations: typeof INTEGRATIONS;
  events: typeof CALENDAR_EVENTS;
  addTask: (task: (typeof TASKS)[number]) => void;
  toggleIntegration: (id: string) => void;
  addEvent: (event: (typeof CALENDAR_EVENTS)[number]) => void;
};

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  tasks: TASKS,
  integrations: INTEGRATIONS,
  events: CALENDAR_EVENTS,
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  toggleIntegration: (id) => set((state) => ({ integrations: state.integrations.map((item) => item.id === id ? { ...item, connected: !item.connected, status: item.connected ? "disconnected" : "active" } : item) })),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
}));
