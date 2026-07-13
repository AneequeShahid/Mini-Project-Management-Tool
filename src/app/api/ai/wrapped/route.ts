import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    tasksCompleted: 241,
    focusStreakDays: 18,
    peakActiveHour: "10 PM",
    mostUsedAgent: "Architect Agent",
    biggestSprintName: "Sprint 14: Core Next-Gen",
    teamBadges: [
      { name: "Code Crusader", desc: "Completed 100+ tasks successfully", icon: "⚔️" },
      { name: "Agent Whisperer", desc: "Triggered 500+ AI persona tool calls", icon: "🤖" },
      { name: "Streak Master", desc: "Active for 18 consecutive days", icon: "🔥" }
    ],
    velocityMetrics: [
      { month: "Jan", velocity: 32 },
      { month: "Feb", velocity: 40 },
      { month: "Mar", velocity: 48 },
      { month: "Apr", velocity: 52 },
    ]
  });
}
