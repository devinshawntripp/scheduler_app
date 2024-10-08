import { ActionFunction, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { incrementUsage } from "~/utils/auth.server";
import { validateApiKey } from "~/utils/apiKey.server";
import { getUserById } from "~/models/user.server";
import { google } from 'googleapis';
import { sendEventNotification } from "~/utils/email.server";

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
    // Implement Apple Calendar integration here
    console.log('Apple Calendar integration not implemented yet');
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const apiKey = formData.get("apiKey") as string;
    const userId = formData.get("userId") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const duration = parseInt(formData.get("duration") as string) || 60; // Default to 60 minutes if not provided

    if (!apiKey) {
        return json({ error: "API key is required" }, { status: 400 });
    }

    const isValidApiKey = await validateApiKey(apiKey);
    if (!isValidApiKey) {
        return json({ error: "Invalid API key or usage limit exceeded" }, { status: 403 });
    }

    try {
        // Combine date and time, then create Date objects
        const startDateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

        // Create the booking
        const booking = await prisma.booking.create({
            data: {
                contractorId: userId,
                startDateTime,
                endDateTime,
                customerFirstName: formData.get("customerFirstName") as string || "John",
                customerLastName: formData.get("customerLastName") as string || "Doe",
                city: formData.get("city") as string || "Chicago",
                state: formData.get("state") as string || "IL",
                address: formData.get("address") as string || "123 Main St",
                description: formData.get("description") as string || "Booking notes",
                teamOwnerId: userId, // Assuming the contractor is also the team owner for now
            },
        });

        await incrementUsage(apiKey);

        // Get user for calendar integration
        const user = await getUserById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Google Calendar integration
        if (user.googleCalendarRefreshToken) {
            await createGoogleCalendarEvent(user.googleCalendarRefreshToken, booking);
        }

        // Apple Calendar integration (placeholder)
        if (user.appleCalendarToken) {
            await createAppleCalendarEvent(user.appleCalendarToken, booking);
        }

        // Send email notification
        await sendEventNotification(user.email, booking);

        return json({ success: true, message: "Booking created successfully", booking });
    } catch (error) {
        console.error("Error creating booking:", error);
        return json({ error: "Failed to create booking" }, { status: 500 });
    }
};