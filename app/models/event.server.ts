import { PrismaClient } from "@prisma/client";
import type { ExtendedEvent } from "~/types";

const prisma = new PrismaClient();

export async function createEvent(
  userId: string,
  title: string,
  start: Date,
  end: Date,
  description?: string
): Promise<ExtendedEvent> {
  return prisma.event.create({
    data: {
      userId,
      title,
      start,
      end,
      description,
    },
  });
}

export async function getEventsByUserId(userId: string): Promise<ExtendedEvent[]> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  const events = await prisma.event.findMany({
    where: {
      userId,
      start: {
        gte: oneMonthAgo,
        lte: oneMonthFromNow,
      },
    },
    orderBy: { start: 'asc' },
  });

  return events.map(event => ({
    ...event,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
  }));
}

export async function updateEvent(
  id: string,
  data: {
    title?: string;
    start?: Date;
    end?: Date;
    description?: string;
  }
): Promise<ExtendedEvent> {
  return prisma.event.update({
    where: { id },
    data,
  });
}

export async function deleteEvent(id: string): Promise<ExtendedEvent> {
  return prisma.event.delete({
    where: { id },
  });
}
//fix this function
//rewrite this function to get events by userIds
export async function getEventsByUserIds(userIdsString: string): Promise<(Event | Booking)[]> {
  const userIds = userIdsString.split(',').map(id => id.trim());
  console.log("Fetching events for userIds:", userIds);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

  const [events, bookings] = await Promise.all([
    prisma.event.findMany({
      where: {
        userId: { in: userIds },
        start: { gte: oneMonthAgo, lte: oneMonthFromNow },
      },
      orderBy: { start: 'asc' },
    }),
    prisma.booking.findMany({
      where: {
        OR: [
          { teamOwnerId: { in: userIds } },
          { contractorId: { in: userIds } },
        ],
        startDateTime: { gte: oneMonthAgo, lte: oneMonthFromNow },
      },
      orderBy: { startDateTime: 'asc' },
    }),
  ]);

  console.log("Found events:", events);
  console.log("Found bookings:", bookings);

  const formattedEvents = events.map(event => ({
    ...event,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
  }));

  const formattedBookings = bookings.map(booking => ({
    id: booking.id,
    title: `Booking: ${booking.customerFirstName} ${booking.customerLastName}`,
    start: booking.startDateTime.toISOString(),
    end: booking.endDateTime.toISOString(),
    userId: booking.contractorId, // or teamOwnerId, depending on your needs
    description: booking.description,
  }));

  return [...formattedEvents, ...formattedBookings];
}

