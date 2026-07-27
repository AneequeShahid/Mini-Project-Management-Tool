import { BaseIntegrationConnector } from "../base";
import { WebClient } from "@slack/web-api";
import { getDecryptedAccessToken } from "@/lib/integrationTokenManager";
import { EventBus } from "@/lib/eventBus";

export class SlackConnector extends BaseIntegrationConnector {
  providerName = "slack";

  async postMessage(workspaceId: string, channel: string, text: string) {
    const token = (await getDecryptedAccessToken(workspaceId, "slack")) || process.env.SLACK_BOT_TOKEN;

    if (!token) {
      console.log(`[Slack Prototype: ${channel}] Message: ${text}`);
      await EventBus.publish({
        workspaceId,
        action: "SLACK_MESSAGE_POSTED",
        details: { channel, text, fallback: true }
      });
      return { success: true, channel, text, fallback: true, message: "Slack prototype message logged." };
    }

    try {
      const client = new WebClient(token);
      const res = await client.chat.postMessage({
        channel,
        text,
      });

      await EventBus.publish({
        workspaceId,
        action: "SLACK_MESSAGE_POSTED",
        details: {
          channel,
          text,
          ts: res.ts,
        },
      });

      return {
        success: true,
        channel,
        text,
        ts: res.ts,
        message: "Slack alert posted successfully.",
      };
    } catch (err: any) {
      console.error("[Slack] postMessage failed:", err.message);
      throw err;
    }
  }
}

export const slackConnector = new SlackConnector();
