import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { listRules, createRule, updateRule, deleteRule } from "../../controllers/automationController.js";
import { triggerWorkflow, triggerWebhook } from "../../services/n8n.js";
import { sendEmail } from "../../services/email.js";
import { AutomationRule } from "../../models/automationRule.js";

const router = Router();
router.use(requireAuth);

router.get("/workspace/:workspaceId", listRules);
router.post("/workspace/:workspaceId", createRule);
router.put("/:id", updateRule);
router.delete("/:id", deleteRule);

router.post("/workspace/:workspaceId/trigger", async (req, res) => {
  const { event, data } = req.body;
  const rules = await AutomationRule.find({ workspace: req.params.workspaceId, enabled: true, "trigger.event": event });
  const results = [];
  for (const rule of rules) {
    try {
      if (rule.action.type === "n8n") {
        const result = await triggerWorkflow(rule.action.params.workflowId, { event, data, rule: rule.name });
        results.push({ rule: rule.name, executed: true, n8n: result });
      } else if (rule.action.type === "webhook") {
        const result = await triggerWebhook(rule.action.params.url, { event, data, rule: rule.name });
        results.push({ rule: rule.name, executed: true, webhook: result });
      } else if (rule.action.type === "email") {
        await sendEmail({
          to: rule.action.params.to,
          subject: rule.action.params.subject || `Automation: ${event}`,
          html: rule.action.params.template || `<p>Event: ${event}</p><pre>${JSON.stringify(data, null, 2)}</pre>`,
        });
        results.push({ rule: rule.name, executed: true });
      } else if (rule.action.type === "slack") {
        await triggerWebhook(rule.action.params.webhookUrl, {
          text: `*${rule.name}* triggered by *${event}*\n${rule.action.params.message || ""}`,
        });
        results.push({ rule: rule.name, executed: true });
      } else if (rule.action.type === "discord") {
        await triggerWebhook(rule.action.params.webhookUrl, {
          content: `**${rule.name}** triggered by **${event}**\n${rule.action.params.message || ""}`,
        });
        results.push({ rule: rule.name, executed: true });
      } else {
        results.push({ rule: rule.name, executed: true });
      }
    } catch (e) {
      results.push({ rule: rule.name, executed: false, reason: e.message });
    }
  }
  res.json({ results });
});

router.post("/n8n/webhook", async (req, res) => {
  const { event, data } = req.body;
  const rules = await AutomationRule.find({ enabled: true, "trigger.event": event || "n8n_webhook" });
  for (const rule of rules) {
    try {
      if (rule.action.type === "moveTask" && data?.taskId) {
        const Task = (await import("../../models/task.js")).default;
        await Task.findByIdAndUpdate(data.taskId, { status: rule.action.params.status });
      } else if (rule.action.type === "assignTask" && data?.taskId) {
        const Task = (await import("../../models/task.js")).default;
        await Task.findByIdAndUpdate(data.taskId, { assignee: rule.action.params.userId });
      }
    } catch (e) {
      console.error(`n8n webhook handler error: ${e.message}`);
    }
  }
  res.json({ received: true });
});

export default router;
