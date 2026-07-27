import { BaseIntegrationConnector } from "../base";

export class DiscordConnector extends BaseIntegrationConnector {
  providerName = "discord";

  async postToWebhook(webhookUrl: string, content: string) {
    console.log(`[Discord Webhook] ${content}`);
    return { success: true, webhookUrl, content };
  }
}
export const discordConnector = new DiscordConnector();
