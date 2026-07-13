import { BaseIntegrationConnector } from "../base";
import { getDecryptedAccessToken } from "@/lib/integrationTokenManager";
import { EventBus } from "@/lib/eventBus";

export class ZoomMeetingsConnector extends BaseIntegrationConnector {
  providerName = "zoom";

  async createZoomMeeting(workspaceId: string, topic: string, startTime: string, duration = 30) {
    const accessToken = await getDecryptedAccessToken(workspaceId, "zoom");
    if (!accessToken) {
      throw new Error("No active Zoom integration token found.");
    }

    try {
      const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          type: 2, // Scheduled meeting
          start_time: startTime,
          duration,
          settings: {
            join_before_host: true,
            jbh_time: 5,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Zoom API error: ${res.statusText}`);
      }

      const zoomData = await res.json();

      await EventBus.publish({
        workspaceId,
        action: "ZOOM_MEETING_CREATED",
        details: {
          meetingId: zoomData.id.toString(),
          joinUrl: zoomData.join_url,
          password: zoomData.password,
          topic: zoomData.topic,
        },
      });

      return {
        meetingId: zoomData.id.toString(),
        joinUrl: zoomData.join_url,
        password: zoomData.password,
        topic: zoomData.topic,
        message: "Zoom meeting scheduled successfully.",
      };
    } catch (err: any) {
      console.error("[ZoomMeetings] Create meeting failed:", err.message);
      throw err;
    }
  }
}

export const zoomMeetingsConnector = new ZoomMeetingsConnector();
