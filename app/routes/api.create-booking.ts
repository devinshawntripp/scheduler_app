import { ActionFunction, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { incrementUsage } from "~/utils/auth.server";
import { validateApiKey } from "~/utils/apiKey.server";
import { getUserById, getAllowedDomains } from "~/models/user.server";
import { google } from 'googleapis';
import { sendEmailNotification } from "~/utils/email";

// Set up Google Calendar API
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/api/google-calendar-callback`
);

async function createGoogleCalendarEvent(refreshToken: string, booking: any) {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
            summary: `Booking with ${booking.customerFirstName} ${booking.customerLastName}`,
            description: booking.description,
            start: {
                dateTime: booking.startDateTime.toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: booking.endDateTime.toISOString(),
                timeZone: 'UTC',
            },
        },
    });
}

async function createAppleCalendarEvent(appleCalendarToken: string, booking: any) {
    // Implement Apple Calendar integration
    if (!appleCalendarToken) {
        console.error('Apple Calendar token is missing');
        return;
    }

    try {
        const ical = require('ical-generator');
        const axios = require('axios');

        // Create iCal event
        const cal = ical({ name: 'Booking Calendar' });
        cal.createEvent({
            start: booking.startDateTime,
            end: booking.endDateTime,
            summary: `Booking with ${booking.customerFirstName} ${booking.customerLastName}`,
            description: booking.description,
            location: `${booking.address}, ${booking.city}, ${booking.state}`
        });

        // Generate iCal string
        const icalString = cal.toString();

        // Apple Calendar API endpoint
        const appleCalendarEndpoint = 'https://caldav.icloud.com/';

        // Send request to Apple Calendar
        await axios.post(appleCalendarEndpoint, icalString, {
            headers: {
                'Content-Type': 'text/calendar',
                'Authorization': `Bearer ${appleCalendarToken}`
            }
        });

        console.log('Event added to Apple Calendar successfully');
    } catch (error) {
        console.error('Error adding event to Apple Calendar:', error);
        throw error;
    }
    console.log('Apple Calendar integration not implemented yet');
}

export const action: ActionFunction = async ({ request }) => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            },
        });
    }

    const origin = request.headers.get('Origin') || request.headers.get('Referer');
    if (!origin) {
        return json({ error: "Missing origin" }, { status: 400 });
    }

    const formData = await request.formData();
    const apiKey = formData.get("apiKey") as string;
    const userId = formData.get("userId") as string;

    if (!apiKey || !userId) {
        return json({ error: "Missing required parameters" }, {
            status: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            }
        });
    }

    try {
        // Validate API key
        await validateApiKey(apiKey);

        // Validate origin
        const allowedDomains = await getAllowedDomains(userId);

        // Clean up the origin and domains for comparison
        let cleanOrigin = origin.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

        // If the origin is from our own scheduler domain, get the parent window's origin
        if (cleanOrigin.includes('schedule.devintripp.com')) {
            // For form submissions from the embedded widget, trust the request
            // as it's coming from our own domain
            return true;
        }

        const cleanAllowedDomains = allowedDomains.map(domain =>
            domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
        );

        const isAllowedOrigin = cleanAllowedDomains.some(domain =>
            cleanOrigin === domain || cleanOrigin.endsWith(`.${domain}`)
        );

        if (!isAllowedOrigin) {
            return json({
                error: "Origin not allowed",
                details: { origin: cleanOrigin, allowedDomains: cleanAllowedDomains }
            }, {
                status: 403,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                }
            });
        }

        // Extract other form data
        const date = formData.get("date") as string;
        const time = formData.get("time") as string;
        const description = formData.get("description") as string;
        const duration = parseInt(formData.get("duration") as string) || 60;
        const customerEmail = formData.get("customerEmail") as string;

        // Create the booking
        const startDateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

        const booking = await prisma.booking.create({
            data: {
                contractorId: userId,
                startDateTime,
                endDateTime,
                customerEmail,
                customerFirstName: formData.get("customerFirstName") as string || "Guest",
                customerLastName: formData.get("customerLastName") as string || "",
                city: formData.get("city") as string || "",
                state: formData.get("state") as string || "",
                address: formData.get("address") as string || "",
                description: description || "Booking notes",
                teamOwnerId: userId,
            },
        });

        // Increment usage only after successful booking creation
        await incrementUsage(apiKey);

        // Handle calendar integrations and notifications
        const user = await getUserById(userId);
        if (user?.googleCalendarRefreshToken) {
            await createGoogleCalendarEvent(user.googleCalendarRefreshToken, booking);
        }

        await sendEmailNotification(user!.email, booking);

        return json(
            { success: true, message: "Booking created successfully", booking },
            {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                },
            }
        );
    } catch (error) {
        console.error("Error creating booking:", error);
        return json(
            { error: "Failed to create booking", details: error instanceof Error ? error.message : 'Unknown error' },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                }
            }
        );
    }
};