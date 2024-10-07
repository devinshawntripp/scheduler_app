import { prisma } from '~/db.server';

export async function getAvailabilityForUser(userId: string) {
    return prisma.availability.findMany({
        where: { userId },
        orderBy: { dayOfWeek: 'asc' },
    });
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