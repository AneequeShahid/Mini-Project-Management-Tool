import { eventBus } from "../services/eventBus.js";
import { Activity } from "../models/activity.js";
import { emitToProject } from "../services/socket.js";
import { indexTask } from "../services/meiliSearch.js";
import { Task } from "../models/task.js";
import { createNotification } from "../controllers/notificationController.js";

eventBus.subscribe("TASK_CREATED", async (event) => {
  const { taskId, projectId, title, userId } = event.payload;
  
  try {
    const task = await Task.findById(taskId).populate("assignee createdBy", "name email avatar");
    if (!task) return;

    // 1. Activity Log
    await Activity.create({ 
      project: projectId, 
      user: userId, 
      action: "created", 
      entityType: "task", 
      entityId: taskId, 
      details: { title: title } 
    });

    // 2. Socket Emission
    emitToProject(projectId, "task:created", task);

    // 3. Meilisearch Indexing
    indexTask(task);

    // 4. Notifications
    if (task.assignee && task.assignee._id?.toString() !== userId) {
      createNotification(task.assignee._id, { 
        type: "task_assigned", 
        title: "Task assigned", 
        message: `You were assigned: "${title}"`, 
        link: `/projects/${projectId}/sprint/${task.sprint || ""}`, 
        fromUser: userId, 
        project: projectId 
      });
    }
  } catch (err) {
    console.error(`[TaskListener] Error handling TASK_CREATED:`, err);
  }
});
