import { json, LoaderFunction } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { prisma } from '~/db.server';
import { format, addHours, setHours, setMinutes } from 'date-fns';

export const loader: LoaderFunction = async ({ request }) => {
    await requireUserId(request);

    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const userId = url.searchParams.get('userId');

    if (!date || !userId) {
        return json({ error: 'Date and userId are required' }, { status: 400 });
    }

    const selectedDate = new Date(date);
    const startOfDay = setMinutes(setHours(selectedDate, 9), 0); // Start at 9:00 AM
    const endOfDay = setMinutes(setHours(selectedDate, 17), 0); // End at 5:00 PM

    // Fetch existing bookings for the selected date
    const existingBookings = await prisma.booking.findMany({
        where: {
            contractorId: userId,
            startDateTime: {
                gte: startOfDay,
                lt: endOfDay,
            },
        },
        select: {
            startDateTime: true,
            endDateTime: true,
        },
    });

    // Generate all possible time slots
    const allTimeSlots = [];
    let currentSlot = startOfDay;
    while (currentSlot < endOfDay) {
        allTimeSlots.push(format(currentSlot, 'HH:mm'));
        currentSlot = addHours(currentSlot, 1);
    }

    // Filter out booked time slots
    const availableTimes = allTimeSlots.filter(timeSlot => {
        const slotTime = new Date(`${date}T${timeSlot}`);
        return !existingBookings.some(booking =>
            slotTime >= booking.startDateTime && slotTime < booking.endDateTime
        );
    });

    return json({ availableTimes });
};