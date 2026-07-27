import { BaseIntegrationConnector } from "../base";

export class FigmaConnector extends BaseIntegrationConnector {
  providerName = "figma";

  async fetchFrames(fileKey: string) {
    return {
      success: true,
      fileKey,
      frames: ["Home Panel", "Analytics Flow"],
    };
  }
}
export const figmaConnector = new FigmaConnector();
