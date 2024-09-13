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