import { json, LoaderFunction } from '@remix-run/node';
import { validateApiKey } from '~/utils/apiKey.server';
import { prisma } from '~/db.server';
import { startOfDay, endOfDay, format } from 'date-fns';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const userId = url.searchParams.get('userId');
    const apiKey = url.searchParams.get('apiKey');

    if (!date || !userId || !apiKey) {
        return json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const isValidApiKey = await validateApiKey(apiKey);
    if (!isValidApiKey) {
        return json({ error: 'Invalid API key' }, { status: 401 });
    }

    try {
        const parsedDate = new Date(date);
        const dayOfWeek = parsedDate.getDay();

        const availability = await prisma.availability.findFirst({
            where: { userId, dayOfWeek },
        });

        if (!availability) {
            return json({ availableTimes: [] });
        }

        const startTime = new Date(`${format(parsedDate, 'yyyy-MM-dd')}T${availability.startTime}`);
        const endTime = new Date(`${format(parsedDate, 'yyyy-MM-dd')}T${availability.endTime}`);
        const timeSlots = [];

        for (let time = startTime; time < endTime; time.setMinutes(time.getMinutes() + 30)) {
            timeSlots.push(format(time, 'HH:mm'));
        }

        const bookedSlots = await prisma.booking.findMany({
            where: {
                contractorId: userId,
                startDateTime: {
                    gte: startOfDay(parsedDate),
                    lt: endOfDay(parsedDate),
                },
            },
            select: { startDateTime: true },
        });

        const bookedTimes = new Set(bookedSlots.map(slot => format(slot.startDateTime, 'HH:mm')));
        const availableTimes = timeSlots.filter(time => !bookedTimes.has(time));

        return json({ availableTimes });
    } catch (error) {
        console.error('Error fetching available times:', error);
        return json({ error: 'Failed to fetch available times' }, { status: 500 });
    }
};