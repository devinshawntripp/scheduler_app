import { ExtendedBooking } from '~/types';

export function detectConflicts(newBooking: ExtendedBooking, existingBookings: ExtendedBooking[]): ExtendedBooking[] {
  return existingBookings.filter(booking => {
    const newStart = new Date(newBooking.dateTime);
    const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000); // Assume 1-hour duration
    const bookingStart = new Date(booking.dateTime);
    const bookingEnd = new Date(bookingStart.getTime() + 60 * 60 * 1000);

    return (
      (newStart >= bookingStart && newStart < bookingEnd) ||
      (newEnd > bookingStart && newEnd <= bookingEnd) ||
      (newStart <= bookingStart && newEnd >= bookingEnd)
    );
  });
}