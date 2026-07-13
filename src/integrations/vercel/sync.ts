import { BaseIntegrationConnector } from "../base";

export class VercelConnector extends BaseIntegrationConnector {
  providerName = "vercel";

  async fetchDeployments(projectId: string) {
    return {
      success: true,
      projectId,
      deployments: [
        { id: "dep_123", status: "READY", url: "https://gravity-core.vercel.app" }
      ],
    };
  }
}
export const vercelConnector = new VercelConnector();
