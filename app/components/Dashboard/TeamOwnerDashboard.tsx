import React from 'react';
import { Link } from '@remix-run/react';
import BookingForm from '../Booking/BookingForm';
import type { ExtendedBooking } from '~/types';
import { formatInTimeZone } from 'date-fns-tz';
import { APP_TIME_ZONE } from '~/config/app-config';

interface TeamOwnerDashboardProps {
  userId: string;
  bookings: ExtendedBooking[];
}

export default function TeamOwnerDashboard({ userId, bookings }: TeamOwnerDashboardProps) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Booking</h3>
        <BookingForm teamOwnerId={userId} />
      </div>
      
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Upcoming Bookings</h3>
        {bookings.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <li key={booking.id} className="py-4">
                <Link to={`/bookings/${booking.id}`} className="block hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {booking.customerFirstName} {booking.customerLastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatInTimeZone(new Date(booking.startDateTime), APP_TIME_ZONE, 'PPpp')} - {formatInTimeZone(new Date(booking.endDateTime), APP_TIME_ZONE, 'p')}
                      </p>
                    </div>
                    <div>
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No upcoming bookings.</p>
        )}
      </div>
    </div>
  );
}