import { createDAVClient } from "tsdav";

const CLIENTS = new Map();

async function getClient(account) {
  const key = `${account.provider}:${account.id}`;
  if (CLIENTS.has(key)) return CLIENTS.get(key);
  try {
    const client = await createDAVClient({
      serverUrl: account.serverUrl,
      credentials: {
        username: account.username,
        password: account.password,
      },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });
    CLIENTS.set(key, client);
    return client;
  } catch {
    const { caldav } = await import("caldav");
    const davClient = await caldav.createClient(account.serverUrl, {
      username: account.username,
      password: account.password,
    });
    CLIENTS.set(key, davClient);
    return davClient;
  }
}

export async function fetchCalendars(account) {
  const client = await getClient(account);
  if (!client) throw new Error("CalDAV client not available");
  const calendars = await client.fetchCalendars();
  return calendars.map((cal) => ({
    url: cal.url,
    displayName: cal.displayName || "Unnamed Calendar",
    components: cal.components,
  }));
}

export async function fetchEvents(account, calendarUrl, startDate, endDate) {
  const client = await getClient(account);
  if (!client) return [];
  const events = await client.fetchCalendarObjects({
    calendar: { url: calendarUrl },
    start: startDate,
    end: endDate,
    expand: true,
  });
  return events.map((ev) => ({
    uid: ev.uid,
    summary: ev.summary,
    description: ev.description,
    start: ev.start,
    end: ev.end,
    location: ev.location,
    data: ev.data,
  }));
}

export async function createEvent(account, calendarUrl, event) {
  const client = await getClient(account);
  if (!client) throw new Error("CalDAV client not available");
  return client.createCalendarObject({
    calendar: { url: calendarUrl },
    filename: `${event.uid || crypto.randomUUID()}.ics`,
    iCalString: event.iCalString,
  });
}

export async function deleteEvent(account, calendarUrl, eventUrl) {
  const client = await getClient(account);
  if (!client) return;
  await client.deleteCalendarObject({ calendar: { url: calendarUrl }, objectUrl: eventUrl });
}
