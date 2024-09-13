import type { User, Booking, Event } from "@prisma/client";

export interface ExtendedUser extends User {
  hasUnreadInvitation: boolean;
}

export type ExtendedBooking = Booking;
export type ExtendedEvent = Event;

// If you need to extend these types in the future, you can do:
// export interface ExtendedUser extends User {
//   // Additional properties here
// }