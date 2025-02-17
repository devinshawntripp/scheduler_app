import { prisma } from '~/db.server';
import { startOfDay, endOfDay, format } from 'date-fns';

export async function getAvailabilityForUser(userId: string) {
    return prisma.availability.findMany({
        where: { userId },
        orderBy: { dayOfWeek: 'asc' },
    });
}

export async function getAvailableTimesForUser(userId: string, date: Date) {
    const dayOfWeek = date.getDay();
    const availability = await prisma.availability.findFirst({
        where: { userId, dayOfWeek },
    });

    if (!availability) {
        return [];
    }

    // Generate time slots based on availability
    const startTime = new Date(`${format(date, 'yyyy-MM-dd')}T${availability.startTime}`);
    const endTime = new Date(`${format(date, 'yyyy-MM-dd')}T${availability.endTime}`);
    const timeSlots = [];

    for (let time = startTime; time < endTime; time.setMinutes(time.getMinutes() + 30)) {
        timeSlots.push(format(time, 'HH:mm'));
    }

    // Filter out booked slots
    const bookedSlots = await prisma.booking.findMany({
        where: {
            contractorId: userId,
            startDateTime: {
                gte: startOfDay(date),
                lt: endOfDay(date),
            },
        },
        select: { startDateTime: true },
    });

    const bookedTimes = new Set(bookedSlots.map(slot => format(slot.startDateTime, 'HH:mm')));

    return timeSlots.filter(time => !bookedTimes.has(time));
}

export async function updateAllAvailabilities(userId: string, availabilities: Array<{ dayOfWeek: number; startTime: string; endTime: string }>) {
    // Delete all existing availabilities for the user
    await prisma.availability.deleteMany({ where: { userId } });

    // Create new availabilities
    await prisma.availability.createMany({
        data: availabilities.map(a => ({
            userId,
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
        })),
    });

    return getAvailabilityForUser(userId);
}