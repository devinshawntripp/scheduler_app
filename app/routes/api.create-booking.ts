import { ActionFunction, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { validateApiKey, incrementUsage } from "~/utils/auth.server";
import { getUserById } from "~/models/user.server";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const apiKey = formData.get("apiKey") as string;
    const userId = formData.get("userId") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;

    if (!apiKey) {
        return json({ error: "API key is required" }, { status: 400 });
    }

    const isValidApiKey = await validateApiKey(apiKey);
    if (!isValidApiKey) {
        return json({ error: "Invalid API key or usage limit exceeded" }, { status: 403 });
    }

    // Create the booking
    const booking = await prisma.booking.create({
        data: {
            contractorId: userId,
            startDateTime: new Date(`${date}T${time}`),
            endDateTime: new Date(`${date}T${time}`), // You might want to add duration here
            // Add other necessary fields
        },
    });

    await incrementUsage(apiKey);

    // Get user email for notification
    const user = await getUserById(userId);
    const userEmail = user?.email;

    return json({ success: true, message: "Booking created successfully", booking, userEmail });
};