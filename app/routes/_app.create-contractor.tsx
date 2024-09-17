import { json, redirect, type ActionFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { createUser } from "~/models/user.server";
import { inviteContractor } from "~/models/invite.server";
import { requireUserId } from "~/utils/auth.server";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

    // Invite the new contractor
    await inviteContractor(userId, email);
    console.log("Invitation sent to:", email);

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
  const [showPassword, setShowPassword] = useState(false);
  const [contractorEmail, setContractorEmail] = useState("");
  const [contractorPassword, setContractorPassword] = useState("");

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Create a new contractor
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form method="post" className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  onChange={(e) => setContractorEmail(e.target.value)}
                  value={contractorEmail}
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  onChange={(e) => setContractorPassword(e.target.value)}
                  value={contractorPassword}
                  required
                  className="appearance-none block w-full px-3 py-2 pr-12 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <div className="absolute right-0 top-0 mt-2 mr-2">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-300 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
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
            <div className="mt-4 text-red-400 text-center">{actionData.error}</div>
          )}
        </div>
      </div>
    </div>
  );
}