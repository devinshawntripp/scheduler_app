import { google, calendar_v3 } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

export async function getGoogleCalendarEvents(calendarId: string): Promise<calendar_v3.Schema$Event[] | undefined> {
  const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyFilePath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
  }

  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: keyFilePath,
  });

  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.list({
    calendarId: calendarId,
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items;
}