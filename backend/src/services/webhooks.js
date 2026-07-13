const WEBHOOK_TIMEOUT = 5000;

export async function sendWebhook(url, event, payload) {
  if (!url) return;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);
    const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    const isDiscord = url.includes("discord.com/api/webhooks");
    const isSlack = url.includes("hooks.slack.com");
    if (isDiscord) {
      const embed = makeDiscordEmbed(event, payload);
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(embed), signal: controller.signal });
    } else if (isSlack) {
      const blocks = makeSlackBlocks(event, payload);
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(blocks), signal: controller.signal });
    } else {
      await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: controller.signal });
    }
    clearTimeout(timeout);
  } catch (err) {
    if (err.name !== "AbortError") console.error(`Webhook error for ${url}:`, err.message);
  }
}

function makeDiscordEmbed(event, payload) {
  const color = event.includes("created") ? 0x57F287 : event.includes("deleted") ? 0xED4245 : event.includes("completed") ? 0x57F287 : 0xFEE75C;
  const title = `**${event}**`;
  const description = payload.title || payload.name || payload.message || "Event occurred";
  const fields = [];
  if (payload.status) fields.push({ name: "Status", value: payload.status, inline: true });
  if (payload.priority) fields.push({ name: "Priority", value: payload.priority, inline: true });
  if (payload.assignee?.name) fields.push({ name: "Assignee", value: payload.assignee.name, inline: true });
  if (payload.project) fields.push({ name: "Project", value: typeof payload.project === "object" ? payload.project.name || payload.project._id : payload.project, inline: true });
  return {
    embeds: [{
      title, description, color,
      fields: fields.length > 0 ? fields : undefined,
      timestamp: new Date().toISOString(),
    }],
  };
}

function makeSlackBlocks(event, payload) {
  const blocks = [
    { type: "header", text: { type: "plain_text", text: `📢 ${event}` } },
    { type: "section", text: { type: "mrkdwn", text: `*${payload.title || payload.name || payload.message || "Event occurred"}*` } },
  ];
  const fields = [];
  if (payload.status) fields.push({ type: "mrkdwn", text: `*Status:* ${payload.status}` });
  if (payload.priority) fields.push({ type: "mrkdwn", text: `*Priority:* ${payload.priority}` });
  if (payload.assignee?.name) fields.push({ type: "mrkdwn", text: `*Assignee:* ${payload.assignee.name}` });
  if (fields.length > 0) blocks.push({ type: "section", fields });
  if (payload.link) blocks.push({ type: "section", text: { type: "mrkdwn", text: `<${payload.link}|View in PM Tool>` } });
  blocks.push({ type: "divider" });
  return { blocks };
}
