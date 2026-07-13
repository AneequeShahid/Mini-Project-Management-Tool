import { BaseIntegrationConnector } from "../base";

export class GoogleMeetConnector extends BaseIntegrationConnector {
  providerName = "google-meet";

  async createMeeting(topic: string, startTime: string) {
    const meetingId = Math.random().toString(36).substring(7);
    return {
      meetingId,
      joinUrl: `https://meet.google.com/${meetingId}`,
      topic,
      startTime,
    };
  }
}
export const googleMeetConnector = new GoogleMeetConnector();
