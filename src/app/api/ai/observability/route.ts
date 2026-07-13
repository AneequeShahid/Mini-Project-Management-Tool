import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    // Query database record counts
    const { count: tasksCount } = await supabaseServer.from("tasks").select("*", { count: "exact", head: true });
    const { count: auditCount } = await supabaseServer.from("audit_trail").select("*", { count: "exact", head: true });
    const { count: proposalsCount } = await supabaseServer.from("proposals").select("*", { count: "exact", head: true });

    // Mock active telemetry trends
    const tokensHistory = [
      { name: "Mon", tokens: 8000 + (tasksCount || 0) * 100, cost: 0.016 },
      { name: "Tue", tokens: 12000 + (auditCount || 0) * 200, cost: 0.024 },
      { name: "Wed", tokens: 15000 + (proposalsCount || 0) * 300, cost: 0.030 },
      { name: "Thu", tokens: 22000, cost: 0.044 },
      { name: "Fri", tokens: 28000, cost: 0.056 },
      { name: "Sat", tokens: 10000, cost: 0.020 },
      { name: "Sun", tokens: 9000, cost: 0.018 },
    ];

    const totalCost = tokensHistory.reduce((acc, curr) => acc + curr.cost, 0);

    return NextResponse.json({
      metrics: {
        totalCost: `$${totalCost.toFixed(3)}`,
        averageLatency: "1.42s",
        cacheHitRate: "94.8%",
        toolSuccessRate: "99.9%",
      },
      tokenUsageHistory: tokensHistory,
      systemCounts: {
        tasks: tasksCount || 0,
        events: auditCount || 0,
        proposals: proposalsCount || 0,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
