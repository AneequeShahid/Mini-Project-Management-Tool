import OpenAI from "openai";
import { toolRegistry } from "./toolRegistry.js";
import { memoryService } from "./memoryService.js";
import { metricsService } from "./metricsService.js";

function getClient() {
  const baseURL = process.env.AI_API_URL || "https://api.openai.com/v1";
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || (process.env.AI_PROVIDER === "ollama" ? "ollama" : null);
  if (!apiKey) return null;
  return new OpenAI({ baseURL, apiKey });
}

const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

function getModelForPersona(persona) {
  if (process.env.AI_PROVIDER === "openrouter") {
    const mapping = {
      planner: process.env.OPENROUTER_PLANNER_MODEL || "qwen/qwen-2.5-32b-instruct",
      reviewer: process.env.OPENROUTER_REVIEWER_MODEL || "qwen/qwen-2.5-32b-instruct",
      architect: process.env.OPENROUTER_ARCHITECT_MODEL || "deepseek/deepseek-r1",
      developer: process.env.OPENROUTER_DEVELOPER_MODEL || "deepseek/deepseek-r1",
      researcher: process.env.OPENROUTER_RESEARCHER_MODEL || "deepseek/deepseek-r1",
      qa: process.env.OPENROUTER_QA_MODEL || "meta-llama/llama-3.3-70b-instruct",
      storyteller: process.env.OPENROUTER_STORY_MODEL || "mistralai/mistral-small",
      manager: process.env.OPENROUTER_PLANNER_MODEL || "qwen/qwen-2.5-32b-instruct",
    };
    return mapping[persona] || process.env.AI_MODEL || "qwen/qwen-2.5-7b-instruct:free";
  }
  return process.env.AI_MODEL || "gpt-4o-mini";
}

const AGENT_PROMPTS = {
  router: "You are the AI Orchestrator. Analyze the user request and decide which specialist agent(s) are needed. Respond ONLY with a JSON array of personas: ['architect', 'developer', 'qa', 'manager', 'storyteller', 'general'].",
  general: "You are a helpful AI assistant for an Agile project management tool. Be concise and practical.",
  architect: "You are a Software Architect. Focus on design, modularity, and technical breakdown.",
  developer: "You are a Senior Software Engineer. Focus on implementation, clean code, and debugging.",
  qa: "You are a QA Lead. Focus on edge cases, risk, and stability.",
  manager: "You are an Agile Project Manager. Focus on velocity, deadlines, and team health.",
  storyteller: "You are a Project Storyteller. Turn metrics into a compelling narrative of the team's journey.",
  critic: "You are a Critical Reviewer. Your job is to find flaws, hallucinations, or missing details in the provided answer. Be brutal but constructive.",
};

/**
 * Context Compression: Summarizes old messages to save tokens.
 */
async function compressContext(messages) {
  if (messages.length < 10) return messages;

  const client = getClient();
  if (!client) return messages;

  const toSummarize = messages.slice(0, -5);
  const recent = messages.slice(-5);

  const summaryRes = await client.chat.completions.create({
    model: getModelForPersona("general"),
    messages: [
      { role: "system", content: "Summarize the key decisions and context of this conversation concisely." },
      ...toSummarize
    ],
  });

  const summary = summaryRes.choices[0].message.content;
  return [
    { role: "system", content: `Previous conversation summary: ${summary}` },
    ...recent
  ];
}

async function runReasoningLoop(persona = "general", messages, context = {}) {
  const client = getClient();
  if (!client) return fallbackResponse(AGENT_PROMPTS[persona], messages[messages.length - 1].content);

  // 1. Context Compression
  const compressedMessages = await compressContext(messages);

  // 2. Proactive Memory Retrieval
  let recalledMemories = "";
  if (context.userId) {
    const lastMessage = messages[messages.length - 1].content;
    const memories = await memoryService.retrieveMemories({
      userId: context.userId,
      projectId: context.projectId,
      query: lastMessage,
      limit: 3
    });
    if (memories.length > 0) {
      recalledMemories = "\n\nRecalled Memories:\n" + memories.map(m => `[${m.type}] ${m.content}`).join("\n");
    }
  }

  const systemPrompt = `${AGENT_PROMPTS[persona]} \nContext: ${JSON.stringify(context)}${recalledMemories}`;
  const tools = toolRegistry.getToolDefinitions();
  
  let currentMessages = [
    { role: "system", content: systemPrompt },
    ...compressedMessages,
  ];

  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (iterations < MAX_ITERATIONS) {
    const response = await client.chat.completions.create({
      model: getModelForPersona(persona),
      messages: currentMessages,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;
    currentMessages.push(message);

    if (message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        const name = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        try {
          const result = await toolRegistry.executeTool(name, args, context);
          currentMessages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify(result) });
        } catch (err) {
          currentMessages.push({ role: "tool", tool_call_id: toolCall.id, content: JSON.stringify({ error: err.message }) });
        }
      }
      iterations++;
    } else {
      return message.content;
    }
  }
  return "Reasoning limit reached.";
}

/**
 * Adaptive Routing & Self-Reflection
 */
async function runAdaptiveOrchestrator(messages, context = {}) {
  const client = getClient();
  if (!client) return "AI Service Unavailable";

  // 1. Adaptive Routing: Decide which agent(s) to use
  const routerRes = await client.chat.completions.create({
    model: getModelForPersona("planner"),
    messages: [
      { role: "system", content: AGENT_PROMPTS.router },
      ...messages
    ],
    response_format: { type: "json_object" }
  });

  const { personas } = JSON.parse(routerRes.choices[0].message.content);
  const pipeline = Array.isArray(personas) ? personas : [personas];

  // 2. Execute Pipeline
  let finalAnswer = "";
  for (const persona of pipeline) {
    finalAnswer = await runReasoningLoop(persona, messages, context);
  }

  // 3. Self-Reflection Loop (Critic Pass)
  const reflectionRes = await client.chat.completions.create({
    model: getModelForPersona("reviewer"),
    messages: [
      { role: "system", content: AGENT_PROMPTS.critic },
      { role: "user", content: `Original Request: ${messages[messages.length - 1].content}\n\nProposed Answer: ${finalAnswer}\n\nDoes this answer meet all requirements? Are there any hallucinations or missing details? If it's perfect, respond with 'APPROVED'. Otherwise, suggest specific improvements.` }
    ]
  });

  const reflection = reflectionRes.choices[0].message.content;
  if (reflection.includes("APPROVED")) {
    return finalAnswer;
  } else {
    // One final refinement based on critique
    const refinedRes = await client.chat.completions.create({
      model: getModelForPersona("reviewer"),
      messages: [
        { role: "system", content: "Refine the answer based on the critic's feedback to make it perfect." },
        { role: "user", content: `Answer: ${finalAnswer}\n\nCritique: ${reflection}` }
      ]
    });
    return refinedRes.choices[0].message.content;
  }
}

// Fallbacks (preserved as requested)
function fallbackResponse(system, user) {
  return {
    project: { name: "Fallback Project" },
    sprints: [],
    backend: "Implement the feature with standard structure.",
    points: 5,
    summary: "Code looks good, no major issues found.",
    keyPoints: ["Discussed project goals"],
    actionItems: [],
    plan: "Standard sprint plan",
    riskLevel: "Low",
    factors: [],
    docs: "Project documentation.",
    notes: "Release notes for version 1.0.",
    standup: "Today I will work on tasks.",
    reply: "AI service not configured."
  };
}

export const ai = {
  chat: async (messages, context) => {
    const result = await runAdaptiveOrchestrator(messages, context);
    return { reply: result };
  },
  generateProject: (description) => runReasoningLoop("manager", [{ role: "user", content: description }], {}),
  breakdownTask: (taskDescription) => runReasoningLoop("architect", [{ role: "user", content: taskDescription }], {}),
  estimateStoryPoints: (taskDescription) => runReasoningLoop("developer", [{ role: "user", content: taskDescription }], {}),
  planSprint: (context) => runReasoningLoop("manager", [{ role: "user", content: "Plan sprint" }], context),
  generateStandup: (context) => runReasoningLoop("developer", [{ role: "user", content: "Generate standup" }], context),
  summarizeSprint: (context) => runReasoningLoop("manager", [{ role: "user", content: "Summarize sprint" }], context),
  predictRisk: (context) => runReasoningLoop("manager", [{ role: "user", content: "Predict risk" }], context),
  generateDocs: (context) => runReasoningLoop("architect", [{ role: "user", content: "Generate docs" }], context),
  codeReview: (context) => runReasoningLoop("developer", [{ role: "user", content: "Review code" }], context),
  meetingSummary: (context) => runReasoningLoop("storyteller", [{ role: "user", content: "Summarize meeting" }], context),
  releaseNotes: (context) => runReasoningLoop("storyteller", [{ role: "user", content: "Generate release notes" }], context),
};
