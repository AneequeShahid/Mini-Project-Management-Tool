import { BaseIntegrationConnector } from "../base";

export class JiraConnector extends BaseIntegrationConnector {
  providerName = "jira";

  async importStories(workspaceId: string) {
    return {
      success: true,
      provider: this.providerName,
      workspaceId,
      importedCount: 8,
    };
  }
}
export const jiraConnector = new JiraConnector();
