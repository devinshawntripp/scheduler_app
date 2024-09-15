import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { createBooking } from "~/models/booking.server";

export const loader: LoaderFunction = async ({ request }) => {
  return json({ message: "Bookings API" });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const teamOwnerId = formData.get("teamOwnerId") as string;
  const contractorId = formData.get("contractorId") as string;
  const customerFirstName = formData.get("customerFirstName") as string;
  const customerLastName = formData.get("customerLastName") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const description = formData.get("description") as string;
  const startDateTime = new Date(formData.get("startDateTime") as string);
  const endDateTime = new Date(formData.get("endDateTime") as string);

  if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
    return json({ error: "Invalid date format" }, { status: 400 });
  }

  try {
    const booking = await createBooking(
      teamOwnerId,
      contractorId,
      customerFirstName,
      customerLastName,
      address,
      city,
      state,
      description,
      startDateTime,
      endDateTime
    );

    return json({ success: true, booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return json({ error: "Failed to create booking" }, { status: 500 });
  }
};