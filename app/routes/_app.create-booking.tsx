import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { getUserById } from "~/models/user.server";
import BookingForm from "~/components/Booking/BookingForm";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (!user) {
    throw new Response("Not Found", { status: 404 });
  }
  if (!user.roles.some((role) => role.name === "team_owner")) {
    return redirect("/dashboard");
  }
  return { userId: user.id };
};

export default function CreateBooking() {
  const { userId } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-blue-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Create New Booking</h1>
          <Link
            to="/dashboard"
            className="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-indigo-100 transition duration-300"
          >
            Back to Dashboard
          </Link>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <BookingForm teamOwnerId={userId} />
        </div>
      </div>
    </div>
  );
}