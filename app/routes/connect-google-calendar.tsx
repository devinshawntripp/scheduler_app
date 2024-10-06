import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node';
import { google } from 'googleapis';
import { getUserById, updateUserGoogleCalendar } from '~/models/user.server';
import { requireUserId } from '~/utils/auth.server';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/connect-google-calendar/callback`
);

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: userId,
  });
  return redirect(authUrl);
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const code = formData.get('code') as string;
  const state = formData.get('state') as string;

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const { data } = await calendar.calendarList.list();

  if (data.items && data.items.length > 0) {
    const primaryCalendar = data.items.find(item => item.primary);
    if (primaryCalendar && primaryCalendar.id) {
      await updateUserGoogleCalendar(state, primaryCalendar.id);
    }
  }

  return redirect('/dashboard');
};