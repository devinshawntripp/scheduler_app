import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { getEventsByUserId } from "~/models/event.server";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    await requireUserId(request);
    
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return json({ error: "userId is required" }, { status: 400 });
    }

    const events = await getEventsByUserId(userId);
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title || 'Booking',
      start: event.startDateTime,
      end: event.endDateTime,
      // Add any other relevant fields
    }));

    return json({ events: formattedEvents || [] }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  } catch (error) {
    console.error("Error in events loader:", error);
    if (error instanceof Response && error.status === 401) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    return json({ error: "Failed to fetch events" }, { status: 500 });
  }
};