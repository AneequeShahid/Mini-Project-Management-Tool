import { Task } from "../models/task.js";
import { Project } from "../models/project.js";
import { User } from "../models/user.js";
import { eventBus } from "./eventBus.js";
import { v4 as uuidv4 } from "uuid";
import { memoryService } from "./memoryService.js";
import { knowledgeGraphService } from "./knowledgeGraphService.js";
import { proposalService } from "./proposalService.js";

/**
 * ToolRegistry provides a standardized way for the AI to interact with the system.
 * Each tool has a definition (for the LLM) and an execution function.
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.initDefaultTools();
  }

  initDefaultTools() {
    // 1. Create Task Tool
    this.registerTool({
      name: "create_task",
      description: "Create a new project task with specified details.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The title of the task" },
          project: { type: "string", description: "The Project ID" },
          description: { type: "string", description: "Detailed description of the task" },
          priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"] },
          assignee: { type: "string", description: "User ID of the assignee" },
        },
        required: ["title", "project"],
      },
      execute: async ({ title, project, description, priority, assignee, context }) => {
        const task = await Task.create({
          title,
          project,
          description,
          priority: priority || "Medium",
          assignee: assignee || null,
          createdBy: context.userId,
        });
        
        eventBus.publish({
          id: uuidv4(),
          type: "TASK_CREATED",
          aggregateId: task._id,
          timestamp: new Date(),
          version: 1,
          payload: { taskId: task._id, projectId: project, title, userId: context.userId },
        });

        return { success: true, taskId: task._id, message: `Task "${title}" created successfully.` };
      },
    });

    // 2. Update Task Status Tool
    this.registerTool({
      name: "update_task_status",
      description: "Update the status of an existing task.",
      parameters: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "The ID of the task to update" },
          status: { type: "string", enum: ["Todo", "In Progress", "Review", "Done"] },
        },
        required: ["taskId", "status"],
      },
      execute: async ({ taskId, status, context }) => {
        const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });
        if (!task) throw new Error("Task not found");
        
        eventBus.publish({
          id: uuidv4(),
          type: "TASK_UPDATED",
          aggregateId: taskId,
          timestamp: new Date(),
          version: 1,
          payload: { taskId, status, userId: context.userId },
        });

        return { success: true, message: `Task status updated to ${status}.` };
      },
    });

    // 3. Search Tasks Tool
    this.registerTool({
      name: "search_tasks",
      description: "Search for tasks within a project using keywords.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keywords" },
          project: { type: "string", description: "Optional Project ID to filter by" },
        },
        required: ["query"],
      },
      execute: async ({ query, project }) => {
        const filter = { title: new RegExp(query, "i") };
        if (project) filter.project = project;
        const tasks = await Task.find(filter).limit(10).select("title status priority");
        return { success: true, tasks };
      },
    });

    // 4. Get Project Details Tool
    this.registerTool({
      name: "get_project_info",
      description: "Retrieve high-level information about a project, including members and status.",
      parameters: {
        type: "object",
        properties: {
          projectId: { type: "string", description: "The ID of the project" },
        },
        required: ["projectId"],
      },
      execute: async ({ projectId }) => {
        const project = await Project.findById(projectId).populate("members", "name role");
        if (!project) throw new Error("Project not found");
        return { 
          success: true, 
          name: project.name, 
          description: project.description, 
          members: project.members 
        };
      },
    });

    // 5. Save Memory Tool
    this.registerTool({
      name: "save_memory",
      description: "Store a piece of long-term memory. Use this for user preferences, team decisions, or project context.",
      parameters: {
        type: "object",
        properties: {
          type: { 
            type: "string", 
            enum: ["semantic", "procedural", "project", "meeting"], 
            description: "semantic: general facts, procedural: how-to/preferences, project: project history, meeting: meeting outcomes" 
          },
          content: { type: "string", description: "The memory content to store" },
          projectId: { type: "string", description: "Optional project ID if this memory is project-specific" },
          metadata: { type: "object", description: "Additional metadata" },
        },
        required: ["type", "content"],
      },
      execute: async ({ type, content, projectId, metadata, context }) => {
        const memory = await memoryService.saveMemory({
          userId: context.userId,
          projectId,
          type,
          content,
          metadata,
        });
        return { success: true, memoryId: memory._id, message: `Memory saved successfully.` };
      },
    });

    // 6. Retrieve Memories Tool
    this.registerTool({
      name: "retrieve_memories",
      description: "Retrieve relevant memories based on a query. Useful for recalling user preferences or previous decisions.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query" },
          projectId: { type: "string", description: "Optional project ID to filter memories" },
          type: { 
            type: "string", 
            enum: ["semantic", "procedural", "project", "meeting"], 
            description: "Optional type filter" 
          },
        },
        required: ["query"],
      },
      execute: async ({ query, projectId, type, context }) => {
        const memories = await memoryService.retrieveMemories({
          userId: context.userId,
          projectId,
          query,
          type,
        });
        return { success: true, memories };
      },
    });

    // 7. Query Knowledge Graph Tool
    this.registerTool({
      name: "query_knowledge_graph",
      description: "Traverse the engineering knowledge graph to find relationships. Use this to find why things are blocked, who is connected to what, or the chain of causality.",
      parameters: {
        type: "object",
        properties: {
          nodeId: { type: "string", description: "The starting node ID (Task, Project, User, etc.)" },
          relation: { type: "string", description: "Optional relation to filter by (e.g., 'depends_on', 'implemented_by')" },
          depth: { type: "number", description: "How deep to traverse (default 2)", default: 2 },
        },
        required: ["nodeId"],
      },
      execute: async ({ nodeId, relation, depth = 2 }) => {
        const subgraph = await knowledgeGraphService.getSubGraph(nodeId, depth);
        return { success: true, subgraph };
      },
    });
  }

  registerTool(tool) {
    this.tools.set(tool.name, tool);
  }

  getToolDefinitions() {
    return Array.from(this.tools.values()).map(t => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
  }

  async executeTool(name, args, context) {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool ${name} not found`);
    
    // Check if this tool should be proposed instead of executed immediately
    const highRiskTools = ["create_task", "update_task_status"];
    if (highRiskTools.includes(name)) {
      const proposal = await proposalService.createProposal({
        toolName: name,
        arguments: args,
        context: context
      });
      return { 
        success: true, 
        status: "proposed", 
        proposalId: proposal._id, 
        message: "This action is high-risk and has been sent to the review queue for approval." 
      };
    }

    return await tool.execute({ ...args, context });
  }
}

export const toolRegistry = new ToolRegistry();
