import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    // Query database records
    const { data: projects = [] } = await supabaseServer.from("projects").select("id, name, description");
    const { data: sprints = [] } = await supabaseServer.from("sprints").select("id, name, project_id, status");
    const { data: tasks = [] } = await supabaseServer.from("tasks").select("id, title, project_id, sprint_id, status");
    const { data: adrs = [] } = await supabaseServer.from("adrs").select("id, title, project_id, status");

    const nodes: any[] = [];
    const edges: any[] = [];

    // Map Projects
    (projects || []).forEach((proj) => {
      nodes.push({
        id: proj.id,
        label: proj.name,
        type: "project",
        details: proj.description || "Active engineering project workspace.",
      });
    });

    // Map Sprints & link to Projects
    (sprints || []).forEach((spr) => {
      nodes.push({
        id: spr.id,
        label: spr.name,
        type: "sprint",
        details: `Milestone status: ${spr.status}`,
      });
      if (spr.project_id) {
        edges.push({ source: spr.project_id, target: spr.id });
      }
    });

    // Map Tasks & link to Sprints/Projects
    (tasks || []).forEach((task) => {
      nodes.push({
        id: task.id,
        label: task.title,
        type: "task",
        details: `Task status: ${task.status}`,
      });
      if (task.sprint_id) {
        edges.push({ source: task.sprint_id, target: task.id });
      } else if (task.project_id) {
        edges.push({ source: task.project_id, target: task.id });
      }
    });

    // Map ADRs & link to Projects
    (adrs || []).forEach((adr) => {
      nodes.push({
        id: adr.id,
        label: adr.title,
        type: "adr",
        details: `Architecture decision status: ${adr.status}`,
      });
      if (adr.project_id) {
        edges.push({ source: adr.project_id, target: adr.id });
      }
    });

    // Fallback: Populate static demonstration nodes if database is empty
    if (nodes.length === 0) {
      const fallbackNodes = [
        { id: "p1", label: "Acme Platform Core", type: "project", details: "Core workspace Migration." },
        { id: "s1", label: "Sprint 14: Core API", type: "sprint", details: "Milestone targeting Next.js API routes." },
        { id: "t1", label: "Implement Supabase Client", type: "task", details: "Create client/server database singletons." },
        { id: "adr1", label: "ADR-004: Next.js Auth", type: "adr", details: "Architecture Decision standardising on Supabase RLS." },
      ];
      const fallbackEdges = [
        { source: "p1", target: "s1" },
        { source: "s1", target: "t1" },
        { source: "t1", target: "adr1" },
      ];
      return NextResponse.json({ nodes: fallbackNodes, edges: fallbackEdges });
    }

    return NextResponse.json({ nodes, edges });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
