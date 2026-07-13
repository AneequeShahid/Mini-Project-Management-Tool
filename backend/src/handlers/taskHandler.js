import { Task } from "../models/task.js";
import { eventBus } from "../services/eventBus.js";
import { v4 as uuidv4 } from "uuid";

export const TaskHandlers = {
  async handleCreateTask(command) {
    const { title, project, sprint, priority, storyPoints, description, issueType, assignee, dueDate, createdBy, customFields } = command;

    const task = await Task.create({
      title, project, sprint, priority, storyPoints, description, issueType, assignee, dueDate, createdBy, customFields
    });

    // Publish Domain Event
    eventBus.publish({
      id: uuidv4(),
      type: "TASK_CREATED",
      aggregateId: task._id,
      timestamp: new Date(),
      version: 1,
      payload: {
        taskId: task._id,
        projectId: task.project,
        title: task.title,
        userId: createdBy,
      },
    });

    return task;
  },
};
