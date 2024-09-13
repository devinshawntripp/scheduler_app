import { json, LoaderFunction } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { getBookingsByTeamOwnerId } from "~/models/booking.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const bookings = await getBookingsByTeamOwnerId(userId);
  return json({ bookings });
};