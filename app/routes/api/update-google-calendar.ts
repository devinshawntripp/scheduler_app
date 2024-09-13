import { json, ActionFunction } from "@remix-run/node";
import { requireUserId } from "~/services/auth.server";
import { updateUserGoogleCalendar } from "~/models/user.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const googleCalendarId = formData.get("googleCalendarId") as string;

  try {
    const updatedUser = await updateUserGoogleCalendar(userId, googleCalendarId);
    return json({ success: true, user: updatedUser });
  } catch (error) {
    return json({ error: "Failed to update Google Calendar ID" }, { status: 500 });
  }
};