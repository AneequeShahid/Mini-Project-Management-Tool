class AIService {
  async generateTaskBreakdown(taskId, prompt) {
    return {
      taskId,
      prompt,
      summary: "AI breakdown placeholder",
      steps: ["Review task details", "Break into implementation steps"],
    };
  }
}

export const AI = new AIService();
