import { NextResponse } from "next/server";
import OpenAI from "openai";
import { toolRegistry } from "@/lib/toolRegistry";
import { DELIVERY_FORECAST, TEAM_PERFORMANCE, VELOCITY_DATA } from "@/lib/data";

const getOpenRouterClient = () => {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "dummy-key";
  const baseURL = process.env.AI_API_URL || "https://openrouter.ai/api/v1";
  return new OpenAI({ apiKey, baseURL });
};

const getModelForPersona = (persona: string) => {
  const mapping: Record<string, string> = {
    planner: process.env.OPENROUTER_PLANNER_MODEL || "qwen/qwen-2.5-32b-instruct",
    reviewer: process.env.OPENROUTER_REVIEWER_MODEL || "qwen/qwen-2.5-32b-instruct",
    architect: process.env.OPENROUTER_ARCHITECT_MODEL || "deepseek/deepseek-r1",
    developer: process.env.OPENROUTER_DEVELOPER_MODEL || "deepseek/deepseek-r1",
    qa: process.env.OPENROUTER_QA_MODEL || "meta-llama/llama-3.3-70b-instruct",
    story: process.env.OPENROUTER_STORY_MODEL || "mistralai/mistral-small",
    manager: process.env.OPENROUTER_PLANNER_MODEL || "qwen/qwen-2.5-32b-instruct",
  };
  return mapping[persona] || "qwen/qwen-2.5-7b-instruct:free";
};

const AGENT_PROMPTS: Record<string, string> = {
  planner: "You are the Planner Agent. Focus on sprint breakdown, project strategy, and priorities. You can create sprints.",
  architect: "You are the Architect Agent. Design system components, database schemas, and propose Architecture Decision Records (ADRs).",
  developer: "You are the Developer Agent. Implement clean code and create project tasks.",
  reviewer: "You are the Reviewer Agent. Critique pull requests, assess formatting compliance, and flag system complexity.",
  qa: "You are the QA Agent. Find edge cases, construct test cases, and evaluate application stability.",
  manager: "You are the Manager Agent. Check velocities, deadlines, team burnout risks, and assign resources.",
};

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const { messages, persona = "developer" } = await request.json();
    const latestPrompt = messages?.filter((message: any) => message.role === "user").at(-1)?.content || "";

    if (!process.env.OPENAI_API_KEY && !process.env.AI_API_KEY) {
      const lowerPrompt = latestPrompt.toLowerCase();
      const overloaded = TEAM_PERFORMANCE.find((member) => member.allocation > member.capacity);
      const reply = lowerPrompt.includes("forecast") || lowerPrompt.includes("delivery")
        ? `Delivery confidence is ${DELIVERY_FORECAST.confidence}%. The likely finish is ${DELIVERY_FORECAST.projected_completion}; the main intervention is to rebalance ${overloaded?.name || "the overloaded engineer"}'s work.`
        : lowerPrompt.includes("team") || lowerPrompt.includes("performance")
          ? `Team delivery is stable. ${overloaded?.name || "One team member"} is above capacity, while the latest sprint delivered ${VELOCITY_DATA.at(-1)?.delivered ?? 0} points. I would move two active work items before the next review.`
          : `Local ${persona} agent is ready. Based on the current workspace, I recommend turning “${latestPrompt}” into a focused task with a clear owner, due date, and acceptance criteria. Add OPENAI_API_KEY on Vercel to enable live model reasoning.`;
      return NextResponse.json({ reply, executedActions: [], metrics: { latencyMs: Date.now() - startTime, estimatedCost: 0, agentUsed: persona, modelUsed: "Gravity local intelligence", selfReflectionPassed: true, mode: "local" } });
    }

    const client = getOpenRouterClient();
    const systemPrompt = AGENT_PROMPTS[persona] || AGENT_PROMPTS.developer;
    const tools = toolRegistry.getToolDefinitions();

    let thread = [
      { role: "system" as const, content: systemPrompt },
      ...messages
    ];

    const agentModel = getModelForPersona(persona);
    const response = await client.chat.completions.create({
      model: agentModel,
      messages: thread,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: "auto",
    });

    const choice = response.choices[0].message;
    let candidateAnswer = choice.content || "";

    // If the model called tools, execute them
    const executedActions: any[] = [];
    if (choice.tool_calls && choice.tool_calls.length > 0) {
      thread.push(choice as any);
      for (const toolCall of choice.tool_calls) {
        const name = (toolCall as any).function.name;
        const args = JSON.parse((toolCall as any).function.arguments);
        try {
          const result = await toolRegistry.executeTool(name, args);
          executedActions.push({ name, args, result });
          thread.push({
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify(result),
          } as any);
        } catch (err: any) {
          thread.push({
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: err.message }),
          } as any);
        }
      }

      // Re-run chat generation with tool execution context
      const secondResponse = await client.chat.completions.create({
        model: agentModel,
        messages: thread,
      });
      candidateAnswer = secondResponse.choices[0].message.content || "";
    }

    // Critic pass
    const criticModel = getModelForPersona("reviewer");
    const criticResponse = await client.chat.completions.create({
      model: criticModel,
      messages: [
        { role: "system" as const, content: "You are a constructive Critic Agent. Assess the proposed answer. If it is high-quality, output ONLY 'APPROVED'. Otherwise, list specific corrections." },
        { role: "user" as const, content: `Proposed Answer:\n${candidateAnswer}` }
      ]
    });

    const critique = criticResponse.choices[0].message.content || "";
    let finalAnswer = candidateAnswer;

    if (!critique.includes("APPROVED")) {
      const refinedResponse = await client.chat.completions.create({
        model: agentModel,
        messages: [
          { role: "system" as const, content: systemPrompt },
          ...messages,
          { role: "assistant" as const, content: candidateAnswer },
          { role: "user" as const, content: `Please refine your previous answer based on this feedback:\n${critique}` }
        ]
      });
      finalAnswer = refinedResponse.choices[0].message.content || candidateAnswer;
    }

    const latency = Date.now() - startTime;

    return NextResponse.json({
      reply: finalAnswer,
      executedActions,
      metrics: {
        latencyMs: latency,
        estimatedCost: 0.0002 + (executedActions.length * 0.0001),
        agentUsed: persona,
        modelUsed: agentModel,
        selfReflectionPassed: critique.includes("APPROVED"),
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
