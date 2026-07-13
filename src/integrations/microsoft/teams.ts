import { BaseIntegrationConnector } from "../base";

export class MicrosoftTeamsConnector extends BaseIntegrationConnector {
  providerName = "microsoft-teams";

  async createTeamsMeeting(topic: string, startTime: string) {
    const meetingId = Math.random().toString(36).substring(7);
    return {
      meetingId,
      joinUrl: `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
      topic,
      startTime,
    };
  }
}
export const microsoftTeamsConnector = new MicrosoftTeamsConnector();
