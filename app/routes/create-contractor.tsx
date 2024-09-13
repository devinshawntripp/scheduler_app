import { json, redirect, type ActionFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { createUser } from "~/models/user.server";
import { requireUserId } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  console.log("Create contractor action started");
  
  try {
    const userId = await requireUserId(request);
    console.log("User ID:", userId);

    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    console.log("Form data received:", { email });

    if (typeof email !== "string" || typeof password !== "string") {
      console.error("Invalid form data");
      return json({ error: "Invalid form data" }, { status: 400 });
    }

    const user = await createUser(email, password, "contractor");
    console.log("Contractor created:", user);

    // Send invitation
    const inviteResponse = await fetch("/api/invite-contractor", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email }),
    });

    if (!inviteResponse.ok) {
      throw new Error("Failed to send invitation");
    }

    return redirect("/dashboard");
  } catch (error) {
    console.error("Error creating contractor:", error);
    if (error instanceof Error && error.message.includes("Unique constraint failed")) {
      return json({ error: "A user with this email already exists" }, { status: 400 });
    }
    return json({ error: "Failed to create contractor" }, { status: 500 });
  }
};

export default function CreateContractor() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new contractor
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form method="post" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={navigation.state === "submitting"}
              >
                {navigation.state === "submitting" ? "Creating..." : "Create Contractor"}
              </button>
            </div>
          </Form>

          {actionData?.error && (
            <div className="mt-4 text-red-600 text-center">{actionData.error}</div>
          )}
        </div>
      </div>
    </div>
  );
}