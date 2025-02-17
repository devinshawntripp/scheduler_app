import type { User, Booking, Event } from "@prisma/client";

export interface UserRole {
  id: string;
  name: string;
}

export interface ExtendedUser extends User {
  roles: UserRole[];
  hasUnreadInvitation: boolean;
  googleCalendarRefreshToken: string | null;
}

export interface ExtendedBooking extends Omit<Booking, 'startDateTime' | 'endDateTime'> {
  startDateTime: Date;
  endDateTime: Date;
}

export type ExtendedEvent = Event;

// If you need to extend these types in the future, you can do:
// export interface ExtendedUser extends User {
//   // Additional properties here
// }