import { generateText, streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { ollama } from "ollama-ai-provider";
import { z } from "zod";

function getModel() {
  const provider = process.env.AI_PROVIDER || "openai";
  const modelName = process.env.AI_MODEL || "gpt-4o-mini";
  if (provider === "ollama") {
    const baseURL = process.env.AI_API_URL || "http://localhost:11434/api";
    return ollama(modelName, { baseURL });
  }
  return openai(modelName);
}

export async function generate(system, prompt) {
  const { text } = await generateText({
    model: getModel(),
    system,
    prompt,
  });
  return text;
}

export async function generateJSON(system, prompt, schema) {
  const result = await generateText({
    model: getModel(),
    system,
    prompt,
    ...(schema ? { tools: {
      respond: tool({ description: "Respond with structured data", parameters: schema }),
    }, maxSteps: 1 } : {}),
  });
  if (schema) {
    const toolCall = result.toolCalls?.[0];
    if (toolCall) return JSON.parse(toolCall.args);
  }
  try { return JSON.parse(result.text); } catch { return { text: result.text }; }
}

export async function* stream(system, prompt) {
  const { textStream } = await streamText({
    model: getModel(),
    system,
    prompt,
  });
  for await (const chunk of textStream) {
    yield chunk;
  }
}
