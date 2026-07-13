import { supabaseServer } from "./supabaseServer";
import fs from "fs";
import path from "path";

// Detect if we should use local JSON database fallback
const isPlaceholder = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder");

const DB_FILE_PATH = path.join(process.cwd(), "backup-db.json");

// Helper to load/save JSON local file
function readLocalDB(): any {
  if (!fs.existsSync(DB_FILE_PATH)) {
    // Generate beautiful initial seed data
    const seed = {
      work_item_types: [
        { id: "wit-epic", name: "Epic", icon: "award", color: "#a855f7" },
        { id: "wit-story", name: "Story", icon: "book-open", color: "#3b82f6" },
        { id: "wit-bug", name: "Bug", icon: "bug", color: "#ef4444" },
        { id: "wit-task", name: "Task", icon: "check-square", color: "#06b6d4" }
      ],
      custom_field_definitions: [
        { id: "cfd-sla", name: "SLA Hours", type: "number", options: [] },
        { id: "cfd-impact", name: "Customer Impact", type: "select", options: ["Low", "Medium", "High", "Critical"] },
        { id: "cfd-phase", name: "Dev Phase", type: "select", options: ["Design", "Implementation", "Verification", "Released"] }
      ],
      views: [
        { id: "v-default-kanban", name: "Sprint Kanban Board", type: "Kanban", query: { groupBy: "status", sortBy: "due_date" } },
        { id: "v-all-bugs", name: "High Severity Bugs", type: "List", query: { work_item_type: "wit-bug", priority: "High" } }
      ],
      triage_items: [
        { id: "tr-1", source: "email", sender: "alex@customer.com", title: "Cannot sync zoom calendars", description: "Getting a connection timeout when linking Google calendars on dashboard.", status: "new", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: "tr-2", source: "form", sender: "Sarah Jenkins", title: "Workflow automation fails on high load", description: "Our custom triggers are dropping tasks when more than 10 webhooks fire concurrently.", status: "new", created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
        { id: "tr-3", source: "api", sender: "pulse-guardrail-bot", title: "Guardrail Breach: Unauthorized API Call Detected", description: "An automated script attempted to call zoom meeting endpoints without a valid bearer key.", status: "new", created_at: new Date().toISOString() }
      ],
      projects: [
        { id: "p-acme", name: "Pulse Core Infrastructure", description: "Core service meshes, event bus integration, and RAG pipelines." }
      ],
      sprints: [
        { id: "s-1", project_id: "p-acme", name: "Sprint 15: Auth & RAG Integration", status: "Active" }
      ],
      tasks: [
        {
          id: "t-1",
          project_id: "p-acme",
          sprint_id: "s-1",
          title: "Migrate Auth Module and Setup pgvector Hybrid Retrieval",
          description: "Sync auth schema with workspace memberships and configure ivfflat indexes for real-time memory retrieval.",
          status: "Todo",
          priority: "Critical",
          story_points: 5,
          due_date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
          work_item_type_id: "wit-story",
          custom_fields: { "cfd-sla": 24, "cfd-impact": "Critical", "cfd-phase": "Design" },
          document_content: "<h2>Auth & pgvector Architecture Specification</h2><p>This is the living spec for our Pulse indexing system. Feel free to format this using standard TipTap controls.</p><ul><li>Use aes-256-cbc for encrypted credentials.</li><li>Utilize pgvector cosine distance operators.</li></ul>",
          created_at: new Date().toISOString()
        },
        {
          id: "t-2",
          project_id: "p-acme",
          sprint_id: "s-1",
          title: "Fix callback redirect failures on Vercel deployment",
          description: "Handle custom domains and port mappings inside OAuth callbacks dynamically.",
          status: "In Progress",
          priority: "High",
          story_points: 3,
          due_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
          work_item_type_id: "wit-bug",
          custom_fields: { "cfd-sla": 12, "cfd-impact": "High", "cfd-phase": "Implementation" },
          document_content: "<h3>OAuth Debug Notes</h3><p>Verify callback URLs in the Zoom developers console.</p>",
          created_at: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(DB_FILE_PATH, "utf8"));
}

function writeLocalDB(data: any) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2));
}

export const dbHelper = {
  isFallback: () => isPlaceholder,

  // 1. Work Item Types
  getWorkItemTypes: async (workspaceId?: string) => {
    if (isPlaceholder) {
      return readLocalDB().work_item_types;
    }
    try {
      const { data, error } = await supabaseServer.from("work_item_types").select("*");
      if (error) throw error;
      return data;
    } catch {
      return readLocalDB().work_item_types;
    }
  },

  createWorkItemType: async (item: any) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      const newItem = { id: "wit-" + Math.random().toString(36).substr(2, 9), ...item };
      db.work_item_types.push(newItem);
      writeLocalDB(db);
      return newItem;
    }
    try {
      const { data, error } = await supabaseServer.from("work_item_types").insert([item]).select().single();
      if (error) throw error;
      return data;
    } catch {
      const db = readLocalDB();
      const newItem = { id: "wit-" + Math.random().toString(36).substr(2, 9), ...item };
      db.work_item_types.push(newItem);
      writeLocalDB(db);
      return newItem;
    }
  },

  deleteWorkItemType: async (id: string) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      db.work_item_types = db.work_item_types.filter((x: any) => x.id !== id);
      writeLocalDB(db);
      return { success: true };
    }
    try {
      const { error } = await supabaseServer.from("work_item_types").delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch {
      const db = readLocalDB();
      db.work_item_types = db.work_item_types.filter((x: any) => x.id !== id);
      writeLocalDB(db);
      return { success: true };
    }
  },

  // 2. Custom Field Definitions
  getCustomFieldDefinitions: async (workspaceId?: string) => {
    if (isPlaceholder) {
      return readLocalDB().custom_field_definitions;
    }
    try {
      const { data, error } = await supabaseServer.from("custom_field_definitions").select("*");
      if (error) throw error;
      return data;
    } catch {
      return readLocalDB().custom_field_definitions;
    }
  },

  createCustomFieldDefinition: async (field: any) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      const newField = { id: "cfd-" + Math.random().toString(36).substr(2, 9), ...field };
      db.custom_field_definitions.push(newField);
      writeLocalDB(db);
      return newField;
    }
    try {
      const { data, error } = await supabaseServer.from("custom_field_definitions").insert([field]).select().single();
      if (error) throw error;
      return data;
    } catch {
      const db = readLocalDB();
      const newField = { id: "cfd-" + Math.random().toString(36).substr(2, 9), ...field };
      db.custom_field_definitions.push(newField);
      writeLocalDB(db);
      return newField;
    }
  },

  deleteCustomFieldDefinition: async (id: string) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      db.custom_field_definitions = db.custom_field_definitions.filter((x: any) => x.id !== id);
      writeLocalDB(db);
      return { success: true };
    }
    try {
      const { error } = await supabaseServer.from("custom_field_definitions").delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch {
      const db = readLocalDB();
      db.custom_field_definitions = db.custom_field_definitions.filter((x: any) => x.id !== id);
      writeLocalDB(db);
      return { success: true };
    }
  },

  // 3. Views
  getViews: async (workspaceId?: string) => {
    if (isPlaceholder) {
      return readLocalDB().views;
    }
    try {
      const { data, error } = await supabaseServer.from("views").select("*");
      if (error) throw error;
      return data;
    } catch {
      return readLocalDB().views;
    }
  },

  createView: async (view: any) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      const newView = { id: "v-" + Math.random().toString(36).substr(2, 9), ...view };
      db.views.push(newView);
      writeLocalDB(db);
      return newView;
    }
    try {
      // Find workspace
      const { data: workspaces } = await supabaseServer.from("workspaces").select("id").limit(1);
      const wsId = workspaces?.[0]?.id || "00000000-0000-0000-0000-000000000000";
      const viewData = { workspace_id: wsId, ...view };

      const { data, error } = await supabaseServer.from("views").insert([viewData]).select().single();
      if (error) throw error;
      return data;
    } catch {
      const db = readLocalDB();
      const newView = { id: "v-" + Math.random().toString(36).substr(2, 9), ...view };
      db.views.push(newView);
      writeLocalDB(db);
      return newView;
    }
  },

  // 4. Triage Items
  getTriageItems: async (workspaceId?: string) => {
    if (isPlaceholder) {
      return readLocalDB().triage_items;
    }
    try {
      const { data, error } = await supabaseServer.from("triage_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    } catch {
      return readLocalDB().triage_items;
    }
  },

  createTriageItem: async (item: any) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      const newItem = { id: "tr-" + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...item };
      db.triage_items.unshift(newItem);
      writeLocalDB(db);
      return newItem;
    }
    try {
      // Find workspace
      const { data: workspaces } = await supabaseServer.from("workspaces").select("id").limit(1);
      const wsId = workspaces?.[0]?.id || "00000000-0000-0000-0000-000000000000";
      const itemData = { workspace_id: wsId, created_at: new Date().toISOString(), ...item };

      const { data, error } = await supabaseServer.from("triage_items").insert([itemData]).select().single();
      if (error) throw error;
      return data;
    } catch {
      const db = readLocalDB();
      const newItem = { id: "tr-" + Math.random().toString(36).substr(2, 9), created_at: new Date().toISOString(), ...item };
      db.triage_items.unshift(newItem);
      writeLocalDB(db);
      return newItem;
    }
  },

  updateTriageItem: async (id: string, updates: any) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      db.triage_items = db.triage_items.map((x: any) => x.id === id ? { ...x, ...updates } : x);
      writeLocalDB(db);
      return db.triage_items.find((x: any) => x.id === id);
    }
    try {
      const { data, error } = await supabaseServer.from("triage_items").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    } catch {
      const db = readLocalDB();
      db.triage_items = db.triage_items.map((x: any) => x.id === id ? { ...x, ...updates } : x);
      writeLocalDB(db);
      return db.triage_items.find((x: any) => x.id === id);
    }
  },

  // 5. Tasks
  getTasks: async (projectId?: string, sprintId?: string, assigneeId?: string) => {
    if (isPlaceholder) {
      let list = readLocalDB().tasks;
      if (projectId) list = list.filter((x: any) => x.project_id === projectId);
      if (sprintId) list = list.filter((x: any) => x.sprint_id === sprintId);
      if (assigneeId) list = list.filter((x: any) => x.assignee_id === assigneeId);
      return list;
    }
    try {
      let query = supabaseServer.from("tasks").select("*");
      if (projectId) query = query.eq("project_id", projectId);
      if (sprintId) query = query.eq("sprint_id", sprintId);
      if (assigneeId) query = query.eq("assignee_id", assigneeId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch {
      let list = readLocalDB().tasks;
      if (projectId) list = list.filter((x: any) => x.project_id === projectId);
      if (sprintId) list = list.filter((x: any) => x.sprint_id === sprintId);
      if (assigneeId) list = list.filter((x: any) => x.assignee_id === assigneeId);
      return list;
    }
  },

  getTask: async (id: string) => {
    if (isPlaceholder) {
      return readLocalDB().tasks.find((x: any) => x.id === id) || null;
    }
    try {
      const { data, error } = await supabaseServer.from("tasks").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    } catch {
      return readLocalDB().tasks.find((x: any) => x.id === id) || null;
    }
  },

  createTask: async (task: any) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      const newTask = {
        id: "t-" + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        custom_fields: {},
        document_content: "",
        ...task
      };
      db.tasks.push(newTask);
      writeLocalDB(db);
      return newTask;
    }
    try {
      const taskData = {
        project_id: task.project_id || task.project,
        sprint_id: task.sprint_id || task.sprint || null,
        title: task.title,
        description: task.description || "",
        status: task.status || "Todo",
        priority: task.priority || "Medium",
        story_points: task.story_points || task.storyPoints || 0,
        assignee_id: task.assignee_id || task.assignee || null,
        blocked_by: task.blocked_by || task.blockedBy || null,
        due_date: task.due_date || task.dueDate || null,
        work_item_type_id: task.work_item_type_id || null,
        custom_fields: task.custom_fields || {},
        document_content: task.document_content || ""
      };
      const { data, error } = await supabaseServer.from("tasks").insert([taskData]).select().single();
      if (error) throw error;
      return data;
    } catch {
      const db = readLocalDB();
      const newTask = {
        id: "t-" + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        custom_fields: {},
        document_content: "",
        ...task
      };
      db.tasks.push(newTask);
      writeLocalDB(db);
      return newTask;
    }
  },

  updateTask: async (id: string, updates: any) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      db.tasks = db.tasks.map((x: any) => x.id === id ? { ...x, ...updates } : x);
      writeLocalDB(db);
      return db.tasks.find((x: any) => x.id === id);
    }
    try {
      const taskData = {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        story_points: updates.story_points !== undefined ? updates.story_points : updates.storyPoints,
        assignee_id: updates.assignee_id !== undefined ? updates.assignee_id : updates.assignee,
        blocked_by: updates.blocked_by !== undefined ? updates.blocked_by : updates.blockedBy,
        due_date: updates.due_date !== undefined ? updates.due_date : updates.dueDate,
        sprint_id: updates.sprint_id !== undefined ? updates.sprint_id : updates.sprint,
        work_item_type_id: updates.work_item_type_id,
        custom_fields: updates.custom_fields,
        document_content: updates.document_content
      };
      const cleanUpdate = Object.fromEntries(Object.entries(taskData).filter(([_, v]) => v !== undefined));

      const { data, error } = await supabaseServer.from("tasks").update(cleanUpdate).eq("id", id).select().single();
      if (error) throw error;
      return data;
    } catch {
      const db = readLocalDB();
      db.tasks = db.tasks.map((x: any) => x.id === id ? { ...x, ...updates } : x);
      writeLocalDB(db);
      return db.tasks.find((x: any) => x.id === id);
    }
  },

  deleteTask: async (id: string) => {
    if (isPlaceholder) {
      const db = readLocalDB();
      db.tasks = db.tasks.filter((x: any) => x.id !== id);
      writeLocalDB(db);
      return { success: true };
    }
    try {
      const { error } = await supabaseServer.from("tasks").delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    } catch {
      const db = readLocalDB();
      db.tasks = db.tasks.filter((x: any) => x.id !== id);
      writeLocalDB(db);
      return { success: true };
    }
  },

  // Projects & Sprints for views engine list queries
  getProjects: async () => {
    if (isPlaceholder) {
      return readLocalDB().projects;
    }
    try {
      const { data, error } = await supabaseServer.from("projects").select("*");
      if (error) throw error;
      return data;
    } catch {
      return readLocalDB().projects;
    }
  },

  getSprints: async (projectId: string) => {
    if (isPlaceholder) {
      return readLocalDB().sprints.filter((x: any) => x.project_id === projectId);
    }
    try {
      const { data, error } = await supabaseServer.from("sprints").select("*").eq("project_id", projectId);
      if (error) throw error;
      return data;
    } catch {
      return readLocalDB().sprints.filter((x: any) => x.project_id === projectId);
    }
  }
};
