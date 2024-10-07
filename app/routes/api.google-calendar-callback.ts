import { LoaderFunction, redirect } from '@remix-run/node';
import { google } from 'googleapis';
import { updateUserGoogleCalendar } from '~/models/user.server';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/api/google-calendar-callback`
);

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // This is the userId we passed earlier

    if (!code || !state) {
        return redirect('/dashboard?error=Google Calendar connection failed');
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Store the refresh token in your database
        await updateUserGoogleCalendar(state, tokens.refresh_token);

        return redirect('/dashboard?success=Google Calendar connected successfully');
    } catch (error) {
        console.error('Error connecting Google Calendar:', error);
        return redirect('/dashboard?error=Google Calendar connection failed');
    }
};