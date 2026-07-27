import { BaseIntegrationConnector } from "../base";

export class LinearConnector extends BaseIntegrationConnector {
  providerName = "linear";

  async importIssues(workspaceId: string) {
    return {
      success: true,
      provider: this.providerName,
      workspaceId,
      importedCount: 5,
    };
  }
}
export const linearConnector = new LinearConnector();
