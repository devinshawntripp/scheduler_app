import React, { useState } from 'react';
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getUserById, getTeamMembers, getUserRoles } from '~/models/user.server';
import Calendar from '~/components/Calendar/Calendar';
import { getEventsByUserIds } from '~/models/event.server';
import { formatInTimeZone } from 'date-fns-tz';
import { APP_TIME_ZONE } from '~/config/app-config';

type User = {
  id: string;
  email: string;
  role: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  userId: string;
  description?: string;
};

type LoaderData = {
  currentUser: User;
  teamMembers: User[];
  events: CalendarEvent[];
  userRoles: string[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const currentUser = await getUserById(userId);
  const teamOwnerId = currentUser?.teamOwnerId ?? '';
  const userRoles = await getUserRoles(userId);

  if (!currentUser) {
    throw new Error('User not found');
  }

  let teamMembers: User[] = [];
  let events: CalendarEvent[] = [];

  const isTeamOwner = userRoles.some(role => role.name === 'team_owner');
  const isManager = userRoles.some(role => role.name === 'manager');

  if (isTeamOwner || isManager) {
    teamMembers = await getTeamMembers(teamOwnerId);
    const userIds = [userId, ...teamMembers.map(member => member.id)];
    events = await getEventsByUserIds(userIds.join(','));
  } else {
    events = await getEventsByUserIds(userId);
  }

  // Convert event times to the correct timezone
  const formattedEvents = events.map(event => ({
    ...event,
    start: formatInTimeZone(new Date(event.start), APP_TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    end: formatInTimeZone(new Date(event.end), APP_TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
  }));

  console.log("Fetched events:", formattedEvents);

  return json({ currentUser, teamMembers, events: formattedEvents, userRoles });
};

export default function CalendarPage() {
  const { currentUser, teamMembers, events, userRoles } = useLoaderData<LoaderData>();
  const [visibleUsers, setVisibleUsers] = useState<string[]>(
    [currentUser.id, ...teamMembers.map(member => member.id)]
  );

  const isTeamOwner = userRoles.some(role => role.name === 'team_owner');
  const isManager = userRoles.some(role => role.name === 'manager');

  const toggleUserVisibility = (userId: string) => {
    setVisibleUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredEvents = events.filter(event => visibleUsers.includes(event.userId));

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Calendar</h1>
      
      {(isTeamOwner || isManager) && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Team Members</h2>
          <div className="flex flex-wrap gap-2">
            {teamMembers.map(member => (
              <button
                key={member.id}
                onClick={() => toggleUserVisibility(member.id)}
                className={`btn btn-sm ${
                  visibleUsers.includes(member.id)
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                {member.email}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-base-100 p-4 rounded-lg shadow-lg">
        <Calendar userId={currentUser.id} events={filteredEvents} />
      </div>
    </div>
  );
}