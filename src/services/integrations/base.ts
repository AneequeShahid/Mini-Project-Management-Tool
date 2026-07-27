export interface IntegrationConnector {
  connect(workspaceId: string, credentials: any): Promise<any>;
  disconnect(workspaceId: string): Promise<any>;
  sync(workspaceId: string): Promise<any>;
  publishEvents(event: any): Promise<void>;
  status(workspaceId: string): Promise<any>;
  health(workspaceId: string): Promise<boolean>;
}

export abstract class BaseIntegrationConnector implements IntegrationConnector {
  abstract providerName: string;

  async connect(workspaceId: string, credentials: any): Promise<any> {
    return { success: true, provider: this.providerName, workspaceId, message: "Connected successfully." };
  }

  async disconnect(workspaceId: string): Promise<any> {
    return { success: true, provider: this.providerName, workspaceId, message: "Disconnected successfully." };
  }

  async sync(workspaceId: string): Promise<any> {
    return { success: true, provider: this.providerName, workspaceId, syncedRecords: 0 };
  }

  async publishEvents(event: any): Promise<void> {
    console.log(`[Integration: ${this.providerName}] Event published:`, event);
  }

  async status(workspaceId: string): Promise<any> {
    return { provider: this.providerName, workspaceId, connected: true };
  }

  async health(workspaceId: string): Promise<boolean> {
    return true;
  }
}
