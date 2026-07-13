import fetch from "node-fetch";

const ZOOM_API_BASE = "https://api.zoom.us/v2";

export const zoomService = {
  async createMeeting(accessToken, meetingDetails) {
    const res = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: meetingDetails.topic,
        type: 2, // Scheduled meeting
        start_time: meetingDetails.startTime,
        duration: meetingDetails.duration || 30,
        settings: {
          host_video: true,
          participant_video: true,
        },
      }),
    });
    if (!res.ok) throw new Error(`Zoom API Error: ${res.statusText}`);
    return res.json();
  },
};
