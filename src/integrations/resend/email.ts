import { BaseIntegrationConnector } from "../base";

export class ResendConnector extends BaseIntegrationConnector {
  providerName = "resend";

  async sendEmail(to: string, subject: string, html: string) {
    console.log(`[Resend Email] Sending to ${to}: ${subject}`);
    return { success: true, messageId: `msg_${Math.random().toString(36).substring(7)}` };
  }
}
export const resendConnector = new ResendConnector();
