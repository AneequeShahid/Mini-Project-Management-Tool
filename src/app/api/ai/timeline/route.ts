import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    summary: "Aneeque Shahid finished the key backend API migrations, resolved 2 task blockers, and decreased target deadline risks by 12% this week.",
    accomplishments: [
      { id: "1", date: "July 8", text: "Successfully completed database client and Supabase migration schemas.", type: "engineering" },
      { id: "2", date: "July 7", text: "Added Google Calendar sync capabilities to the frontend overlay grid.", type: "integration" },
      { id: "3", date: "July 5", text: "Ported Express controllers to Next.js dynamic routing endpoints.", type: "architecture" }
    ],
    keyDecisions: [
      { title: "Supabase vs Custom Mongo Auth", impact: "High", desc: "Drastically simplified token validation and user workspace isolation policies.", adrLink: "#" },
      { title: "gantt-task-react integration", impact: "Medium", desc: "Provided a cleaner React-native rendering over custom SVG layouts.", adrLink: "#" }
    ],
    riskTimeline: [
      { date: "May 2026", risk: 24, reason: "Initial database restructuring phase." },
      { date: "June 2026", risk: 48, reason: "API layer misalignment during transition." },
      { date: "July 2026", risk: 15, reason: "Supabase RLS and server testing passing clean." }
    ],
    collaborator: {
      name: "Planner Agent",
      count: 42,
      text: "Collaborated on 42 task breakdowns and story estimates this week."
    },
    productivityChanges: [
      { month: "May", score: 65 },
      { month: "Jun", score: 80 },
      { month: "Jul", score: 94 }
    ]
  });
}
