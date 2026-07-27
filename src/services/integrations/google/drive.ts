import { BaseIntegrationConnector } from "../base";

export class GoogleDriveConnector extends BaseIntegrationConnector {
  providerName = "google-drive";

  async importFile(fileId: string) {
    return {
      success: true,
      fileId,
      name: "Architecture Proposal.pdf",
      mimeType: "application/pdf",
      sizeBytes: 102450,
      url: `https://drive.google.com/file/d/${fileId}`,
    };
  }
}
export const googleDriveConnector = new GoogleDriveConnector();
