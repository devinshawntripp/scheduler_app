import { ActionFunction, redirect } from '@remix-run/node';
import { google } from 'googleapis';
import { requireUserId } from '~/utils/auth.server';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/api/google-calendar-callback`
);

export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request);

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar'],
        state: userId, // Pass the userId as state to retrieve it in the callback
    });

    return redirect(authUrl);
};