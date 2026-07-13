import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { velocity = 48, teamSize = 5, openBugs = 4, pastSprintsCount = 10 } = await request.json();

    // Simulated XGBoost / LightGBM Regression Models
    // Burnout risk is proportional to open bugs and high velocity demands
    const burnoutBase = (openBugs * 12) + (velocity / teamSize) * 5;
    const burnoutProb = Math.min(Math.max(Math.round(burnoutBase), 10), 95);

    // Sprint success probability decreases with more bugs and less historical data
    const successBase = 95 - (openBugs * 4) + (pastSprintsCount * 1.5) - (velocity / 10);
    const successProb = Math.min(Math.max(Math.round(successBase), 45), 98);

    const deadlineRisk = Math.round((100 - successProb) * 0.7);
    const budgetRisk = Math.round(openBugs * 6);
    const deliveryRisk = Math.round((100 - successProb) * 0.3);

    return NextResponse.json({
      mlModel: "XGBoost + LightGBM Ensemble",
      sprintSuccessProbability: successProb,
      burnoutRisk: burnoutProb,
      risks: {
        deadline: deadlineRisk,
        budget: budgetRisk,
        delivery: deliveryRisk,
      },
      insights: [
        successProb > 80 ? "Sprint stability is strong based on historical velocity." : "High volume of open bugs flags potential sprint delay.",
        burnoutProb > 65 ? "Developer burnout risk is elevated. Consider balancing workload distribution." : "Team capacity limits are within safe zones."
      ]
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
