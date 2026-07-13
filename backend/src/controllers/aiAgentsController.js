import { AIAgent } from "../models/aiAgent.js";
import { requireFields } from "../utils/validators.js";
import { ai } from "../services/ai.js";
import { Task } from "../models/task.js";
import { User } from "../models/user.js";
import { KnowledgeBase } from "../models/knowledgeBase.js";
import { Notification } from "../models/notification.js";

export async function listAgents(req, res) {
  const filter = req.query.workspace ? { workspace: req.query.workspace } : {};
  const agents = await AIAgent.find(filter).populate("createdBy", "name email").sort({ createdAt: -1 });
  res.json(agents);
}

export async function getAgent(req, res) {
  const agent = await AIAgent.findById(req.params.id).populate("createdBy", "name email");
  if (!agent) return res.status(404).json({ message: "Agent not found" });
  res.json(agent);
}

export async function createAgent(req, res) {
  const { name, description, systemPrompt, model, temperature, actions, schedule, memory } = req.body || {};
  requireFields(req.body, "name", "systemPrompt");
  const agent = await AIAgent.create({
    workspace: req.body.workspace || req.query.workspace,
    name, description, systemPrompt,
    model: model || "gpt-4o-mini",
    temperature: temperature ?? 0.7,
    actions: actions || [],
    schedule: schedule || {},
    memory: memory || { enabled: true, contextWindow: 10 },
    createdBy: req.user.id,
  });
  res.status(201).json(agent);
}

export async function updateAgent(req, res) {
  const agent = await AIAgent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!agent) return res.status(404).json({ message: "Agent not found" });
  res.json(agent);
}

export async function deleteAgent(req, res) {
  const agent = await AIAgent.findByIdAndDelete(req.params.id);
  if (!agent) return res.status(404).json({ message: "Agent not found" });
  res.json({ message: "Agent deleted" });
}

export async function executeAgent(req, res) {
  const agent = await AIAgent.findById(req.params.id);
  if (!agent) return res.status(404).json({ message: "Agent not found" });

  const toolExecutor = async (toolName, params) => {
    switch (toolName) {
      case "createTask":
        const task = await Task.create({ ...params, workspace: agent.workspace });
        return { success: true, taskId: task._id };
      case "searchKnowledgeBase":
        const entries = await KnowledgeBase.find({ 
          workspace: agent.workspace, 
          $or: [{ title: new RegExp(params.query, "i") }, { content: new RegExp(params.query, "i") }] 
        }).limit(5);
        return entries.map(e => ({ title: e.title, content: e.content }));
      case "sendNotification":
        const notification = await Notification.create({
          user: params.userId,
          workspace: agent.workspace,
          title: "Agent Notification",
          message: params.message,
        });
        return { success: true, notificationId: notification._id };
      default:
        return { error: `Tool ${toolName} not implemented` };
    }
  };

  agent.status = "running";
  await agent.save();

  try {
    const result = await ai.runAgentLoop(
      { description: agent.description, systemPrompt: agent.systemPrompt },
      req.body.input || "Execute your default routine",
      toolExecutor
    );
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    agent.status = "idle";
    await agent.save();
  }
}
