import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/services/auth.server";
import { createBooking, getBookingsByTeamOwnerId, getBookingsByContractorId } from "~/models/booking.server";
import { getUserById } from "~/models/user.server";
import { detectConflicts } from "~/utils/conflictDetection";
import type { ExtendedBooking } from "~/types";
import { zonedTimeToUtc } from 'date-fns-tz';

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (!user) {
    return json({ error: "User not found" }, { status: 404 });
  }

  if (user.role === "team_owner") {
    const bookings = await getBookingsByTeamOwnerId(userId);
    return json({ bookings });
  } else if (user.role === "employee" || user.role === "contractor") {
    const bookings = await getBookingsByContractorId(userId);
    return json({ bookings });
  } else {
    return json({ error: "Unauthorized" }, { status: 403 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const teamOwnerId = formData.get("teamOwnerId") as string;
  const contractorId = formData.get("contractor") as string;
  const customerFirstName = formData.get("customerFirstName") as string;
  const customerLastName = formData.get("customerLastName") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const description = formData.get("description") as string;
  const startDateTime = zonedTimeToUtc(new Date(formData.get("startDateTime") as string), 'UTC');
  const endDateTime = zonedTimeToUtc(new Date(formData.get("endDateTime") as string), 'UTC');

  try {
    const booking = await createBooking({
      teamOwnerId,
      contractorId,
      customerFirstName,
      customerLastName,
      address,
      city,
      state,
      description,
      startDateTime,
      endDateTime,
    });

    return json({ success: true, booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return json({ error: "Failed to create booking" }, { status: 500 });
  }
}