import { json, LoaderFunction } from '@remix-run/node';
import { getEventsByUserId } from '~/models/event.server';

import { requireUserId } from "~/utils/auth.server";
import { getBookingsByContractorId } from "~/models/booking.server";
import { formatInTimeZone } from 'date-fns-tz';
import { APP_TIME_ZONE } from '~/config/app-config';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    await requireUserId(request);
    
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return json({ error: "userId is required" }, { status: 400 });
    }

    const bookings = await getBookingsByContractorId(userId);
    const events = bookings.map(booking => ({
      id: booking.id,
      title: `${booking.customerFirstName} ${booking.customerLastName}`,
      start: formatInTimeZone(new Date(booking.startDateTime), APP_TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      end: formatInTimeZone(new Date(booking.endDateTime), APP_TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
      description: booking.description,
    }));

    return json({ events });
  } catch (error) {
    console.error("Error in events loader:", error);
    if (error instanceof Response && error.status === 401) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }
    return json({ error: "Failed to fetch events" }, { status: 500 });
  }
};

// export const loader: LoaderFunction = async ({ request }) => {
//   const url = new URL(request.url);
//   const userIds = url.searchParams.get('userIds')?.split(',') || [];
//   const userId = url.searchParams.get('userId');

//   let events = [];

//   if (userIds.length > 0) {
//     events = await Promise.all(userIds.map(id => getEventsByUserId(id)));
//     events = events.flat();
//   } else if (userId) {
//     events = await getEventsByUserId(userId);
//   }

//   return json({ events });
// };