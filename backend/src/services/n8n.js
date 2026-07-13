const N8N_URL = process.env.N8N_WEBHOOK_URL || process.env.N8N_URL || "";

export async function triggerWorkflow(workflowId, payload) {
  if (!N8N_URL) {
    console.log(`[n8n] Would trigger workflow ${workflowId} with payload (not configured)`);
    return { triggered: false, mock: true };
  }
  const url = `${N8N_URL}/webhook/${workflowId}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`n8n webhook error: ${res.status}`);
  const data = res.headers.get("content-type")?.includes("json") ? await res.json() : await res.text();
  return { triggered: true, data };
}

export async function triggerWebhook(webhookUrl, payload) {
  if (!webhookUrl) {
    console.log(`[n8n] Would POST to webhook (no URL provided)`);
    return { triggered: false, mock: true };
  }
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Webhook error: ${res.status}`);
  return { triggered: true, status: res.status };
}
