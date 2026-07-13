import fetch from "node-fetch";

const PROVIDERS = {
  google: {
    listEvents: async (accessToken) => {
      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Google Calendar Error: ${res.statusText}`);
      const data = await res.json();
      return data.items.map(e => ({
        id: e.id,
        title: e.summary,
        startTime: e.start?.dateTime || e.start?.date,
        endTime: e.end?.dateTime || e.end?.date,
        link: e.htmlLink,
        description: e.description,
      }));
    },
    createEvent: async (accessToken, event) => {
      const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error(`Google Calendar Error: ${res.statusText}`);
      return res.json();
    },
  },
  outlook: {
    listEvents: async (accessToken) => {
      const res = await fetch("https://graph.microsoft.com/v1.0/me/events", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`Outlook Error: ${res.statusText}`);
      const data = await res.json();
      return data.value.map(e => ({
        id: e.id,
        title: e.subject,
        startTime: e.start.dateTime,
        endTime: e.end.dateTime,
        link: e.webLink,
        description: e.body?.content,
      }));
    },
    createEvent: async (accessToken, event) => {
      const res = await fetch("https://graph.microsoft.com/v1,0/me/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error(`Outlook Error: ${res.statusText}`);
      return res.json();
    },
  },
};

export const calendarService = {
  async syncEvents(workspaceId, provider, accessToken) {
    const providerSvc = PROVIDERS[provider];
    if (!providerSvc) throw new Error(`Unsupported calendar provider: ${provider}`);
    const events = await providerSvc.listEvents(accessToken);
    return events;
  },

  async createEvent(provider, accessToken, event) {
    const providerSvc = PROVIDERS[provider];
    if (!providerSvc) throw new Error(`Unsupported calendar provider: ${provider}`);
    return providerSvc.createEvent(accessToken, event);
  },
};
