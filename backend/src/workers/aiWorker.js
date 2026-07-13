import { queueService } from "./queueService.js";
import { AI } from "./ai.js";
import { Task } from "../models/task.js";
import { eventBus } from "../services/eventBus.js";

// 1. Define the Queue Processor
const processAITaskBreakdown = async (data) => {
  const { taskId, prompt } = data;
  console.log(`[AI Worker] Processing breakdown for task ${taskId}...`);

  try {
    // Simulate a heavy AI call
    const breakdown = await AI.generateTaskBreakdown(taskId, prompt);
    
    // Update the task with AI suggestions (e.g., in a custom field or a separate collection)
    await Task.findByIdAndUpdate(taskId, { 
      $set: { "customFields.aiBreakdown": breakdown } 
    });

    // Publish event that AI breakdown is complete
    eventBus.publish({
      id: Date.now().toString(),
      type: "AI_BREAKDOWN_COMPLETED",
      aggregateId: taskId,
      timestamp: new Date(),
      version: 1,
      payload: { taskId, status: "completed" },
    });

    return { success: true };
  } catch (err) {
    console.error(`[AI Worker] Breakdown failed for ${taskId}:`, err);
    throw err;
  }
};

// 2. Initialize the Worker
export const initAIWorkers = () => {
  queueService.processQueue("ai-task-breakdown", processAITaskBreakdown);
  console.log("[AI Worker] AI Task Breakdown worker initialized.");
};
