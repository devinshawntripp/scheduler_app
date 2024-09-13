import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/services/auth.server";
import { getGoogleCalendarEvents } from "~/services/google-calendar.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const googleCalendarId = url.searchParams.get("googleCalendarId");

  if (!googleCalendarId) {
    return json({ error: "Google Calendar ID is required" }, { status: 400 });
  }

  try {
    const events = await getGoogleCalendarEvents(googleCalendarId);
    return json({ events });
  } catch (error) {
    return json({ error: "Failed to fetch Google Calendar events" }, { status: 500 });
  }
};