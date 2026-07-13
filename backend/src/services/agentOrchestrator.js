import { toolRegistry } from "./toolRegistry.js";
import { AGENT_PROMPTS } from "./aiPrompts.js"; // Assuming prompts are moved here

export class AgentOrchestrator {
  constructor(client) {
    this.client = client;
  }

  /**
   * Chains multiple agents to solve a complex problem.
   * Example: Planner -> Architect -> Developer -> QA
   */
  async runPipeline(initialInput, context, pipeline = ["planner", "architect", "developer", "qa"]) {
    let currentInput = initialInput;
    const history = [];

    for (const persona of pipeline) {
      console.log(`[Orchestrator] Activating ${persona}...`);
      
      const agentResponse = await this.runAgent(persona, currentInput, context, history);
      history.push({ persona, response: agentResponse });
      
      // The output of one agent becomes the input/context for the next
      currentInput = `Previous analysis from ${persona}: ${agentResponse}\n\nNow, as the ${persona} output, please proceed with your specific role's expertise.`;
    }

    return {
      finalAnswer: history[history.length - 1].response,
      trace: history
    };
  }

  async runAgent(persona, input, context, history) {
    // This calls the existing reasoning loop logic
    // (Implementation would be similar to runReasoningLoop but internalized here)
    return `Simulated ${persona} response to: ${input}`;
  }
}
