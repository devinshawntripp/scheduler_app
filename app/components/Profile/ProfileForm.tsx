import React, { useState } from 'react';
import { Form, useNavigation, useFetcher } from '@remix-run/react';
import type { calendar_v3 } from 'googleapis';
import type { ExtendedUser } from '~/types';

interface User {
  id: string;
  googleCalendarId?: string;
}

interface ProfileFormProps {
  user: ExtendedUser;
  actionData?: { error?: string };
}

interface FetcherData {
  error?: string;
  success?: boolean;
  events?: calendar_v3.Schema$Event[];
}

export default function ProfileForm({ user, actionData }: ProfileFormProps) {
  const [googleCalendarId, setGoogleCalendarId] = useState(user.googleCalendarId || '');
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const fetcher = useFetcher<FetcherData>();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      fetcher.submit(
        { googleCalendarId },
        { method: "post", action: "/api/update-google-calendar" }
      );
    } catch (err) {
      setError('Failed to update Google Calendar ID');
    }
  };

  React.useEffect(() => {
    if (fetcher.data && !fetcher.data.error && fetcher.data.success && googleCalendarId) {
      fetcher.load(`/api/google-calendar?googleCalendarId=${encodeURIComponent(googleCalendarId)}`);
    }
  }, [fetcher.data, googleCalendarId]);

  const events = fetcher.data?.events || [];

  return (
    <Form method="post" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="googleCalendarId" className="block text-sm font-medium text-neon-blue">
          Google Calendar ID
        </label>
        <input
          type="text"
          id="googleCalendarId"
          name="googleCalendarId"
          value={googleCalendarId}
          onChange={(e) => setGoogleCalendarId(e.target.value)}
          className="mt-1 block w-full bg-gray-800 border border-neon-blue rounded-md shadow-sm py-2 px-3 text-neon-blue focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green"
        />
      </div>
      <button
        type="submit"
        disabled={navigation.state === 'submitting'}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-neon-green hover:bg-neon-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-green"
      >
        {navigation.state === 'submitting' ? 'Updating...' : 'Update Profile'}
      </button>
      {error && <p className="text-neon-red">{error}</p>}
      {actionData?.error && <p className="text-neon-red">{actionData.error}</p>}
      {events.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-neon-green">Upcoming Events</h3>
          <ul className="mt-2 divide-y divide-gray-700">
            {events.map((event, index) => (
              <li key={index} className="py-2">
                <p className="text-neon-blue">{event.summary}</p>
                <p className="text-sm text-neon-purple">
                  {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString() : 'No date'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Form>
  );
}