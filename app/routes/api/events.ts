import { json, LoaderFunction, ActionFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/services/auth.server";
import { createEvent, updateEvent, deleteEvent, getEventsByUserId } from "~/models/event.server";
import { getUserById } from "~/models/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const events = await getEventsByUserId(userId);
  return json({ events });
};

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const start = new Date(formData.get("start") as string);
  const end = new Date(formData.get("end") as string);
  const description = formData.get("description") as string;

  try {
    if (request.method === "POST") {
      const event = await createEvent(userId, title, start, end, description);
      return json({ event });
    } else if (request.method === "PUT") {
      const eventId = formData.get("eventId") as string;
      const event = await updateEvent(eventId, { title, start, end, description });
      return json({ event });
    } else if (request.method === "DELETE") {
      const eventId = formData.get("eventId") as string;
      await deleteEvent(eventId);
      return json({ success: true });
    }
  } catch (error) {
    return json({ error: "Failed to process event" }, { status: 500 });
  }
}