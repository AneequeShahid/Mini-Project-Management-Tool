import { BaseIntegrationConnector } from "../base";
import { google } from "googleapis";
import { getDecryptedAccessToken } from "@/lib/integrationTokenManager";
import { EventBus } from "@/lib/eventBus";

export class GoogleCalendarConnector extends BaseIntegrationConnector {
  providerName = "google-calendar";

  private getClient(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.calendar({ version: "v3", auth });
  }

  async sync(workspaceId: string): Promise<any> {
    const accessToken = await getDecryptedAccessToken(workspaceId, "google");
    if (!accessToken) {
      return { success: false, provider: this.providerName, workspaceId, message: "No active connection credentials found." };
    }

    try {
      const calendar = this.getClient(accessToken);
      const res = await calendar.events.list({
        calendarId: "primary",
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = res.data.items || [];
      return {
        success: true,
        provider: this.providerName,
        workspaceId,
        syncedRecords: events.length,
        events: events.map(e => ({
          id: e.id,
          title: e.summary,
          startTime: e.start?.dateTime || e.start?.date,
          endTime: e.end?.dateTime || e.end?.date,
          link: e.htmlLink,
        })),
        details: "Fetched primary calendar events successfully via Google SDK.",
      };
    } catch (err: any) {
      console.error("[GoogleCalendar] Sync error:", err.message);
      return { success: false, provider: this.providerName, workspaceId, error: err.message };
    }
  }

  async createEvent(workspaceId: string, summary: string, description: string, startTime: string, endTime: string) {
    const accessToken = await getDecryptedAccessToken(workspaceId, "google");
    if (!accessToken) {
      throw new Error("No active Google Calendar integration token found.");
    }

    try {
      const calendar = this.getClient(accessToken);
      const res = await calendar.events.insert({
        calendarId: "primary",
        conferenceDataVersion: 1,
        requestBody: {
          summary,
          description,
          start: { dateTime: startTime },
          end: { dateTime: endTime },
          conferenceData: {
            createRequest: {
              requestId: Math.random().toString(36).substring(7),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        },
      });

      const event = res.data;
      const meetLink = event.hangoutLink || event.conferenceData?.entryPoints?.[0]?.uri || "";

      await EventBus.publish({
        workspaceId,
        action: "GOOGLE_CALENDAR_EVENT_CREATED",
        details: {
          eventId: event.id,
          title: event.summary,
          link: event.htmlLink,
          meetLink,
        },
      });

      return {
        id: event.id,
        title: event.summary,
        link: event.htmlLink,
        meetLink,
        message: "Google Calendar event created successfully with Google Meet.",
      };
    } catch (err: any) {
      console.error("[GoogleCalendar] Create event failed:", err.message);
      throw err;
    }
  }
}

export const googleCalendarConnector = new GoogleCalendarConnector();
