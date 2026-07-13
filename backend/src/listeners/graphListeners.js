import { knowledgeGraphService } from "../services/knowledgeGraphService.js";
import { eventBus } from "../services/eventBus.js";

export const graphListeners = {
  async init() {
    // Listen for events and automatically update the Knowledge Graph
    
    // Task Created -> Edge: Project contains Task
    eventBus.subscribe("TASK_CREATED", async (event) => {
      const { projectId, taskId } = event.payload;
      await knowledgeGraphService.addEdge(projectId, taskId, "contains");
    });

    // Task Updated -> If status changes to "Blocked", we might want to add a dependency edge
    eventBus.subscribe("TASK_UPDATED", async (event) => {
      const { taskId, status, payload } = event.payload;
      if (status === "Blocked" && payload?.blockedBy) {
        await knowledgeGraphService.addEdge(taskId, payload.blockedBy, "blocked_by");
      }
    });

    // User assigned to task -> Edge: User assigned_to Task
    eventBus.subscribe("USER_ASSIGNED", async (event) => {
      const { userId, taskId } = event.payload;
      await knowledgeGraphService.addEdge(userId, taskId, "assigned_to");
    });
  }
};
