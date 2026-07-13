import axios from "axios";
import { Integration } from "../models/integration.js";
import crypto from "crypto";

export const outboundWebhookService = {
  async triggerEvent(eventType, payload) {
    const { projectId } = payload;
    if (!projectId) return;

    // Find all active integrations for this event and project
    const integrations = await Integration.find({ 
      projectId, 
      eventType, 
      isActive: true 
    });

    const requests = integrations.map(async (integration) => {
      try {
        const body = {
          event: eventType,
          timestamp: new Date(),
          payload,
          metadata: {
            provider: integration.provider,
            integrationId: integration._id
          }
        };

        // Sign the request if a secret is provided
        const headers = { "Content-Type": "application/json" };
        if (integration.secret) {
          const signature = crypto
            .createHmac("sha256", integration.secret)
            .update(JSON.stringify(body))
            .digest("hex");
          headers["x-hub-signature-256"] = `sha256=${signature}`;
        }

        await axios.post(integration.webhookUrl, body, { headers });
        return { status: "success", url: integration.webhookUrl };
      } catch (err) {
        console.error(`Webhook failed for ${integration.webhookUrl}:`, err.message);
        return { status: "failed", url: integration.webhookUrl, error: err.message };
      }
    });

    return Promise.all(requests);
  }
};
