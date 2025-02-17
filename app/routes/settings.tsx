import type { LoaderFunction, ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, Form, useActionData, useNavigation, useSearchParams } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getUserById, updateUserTimeZone } from '~/services/user.server';

type LoaderData = {
    user: {
        id: string;
        email: string;
        timeZone?: string;
    }
};

type ActionData = {
    error?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);
    if (!user) {
        throw new Response("User not found", { status: 404 });
    }
    return json<LoaderData>({ user });
};

export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const timeZone = formData.get("timeZone");
    if (typeof timeZone !== "string") {
        return json({ error: "Time zone is required" }, { status: 400 });
    }

    await updateUserTimeZone(userId, timeZone);
    return redirect("/settings?success=1");
};

export default function Settings() {
    const { user } = useLoaderData<LoaderData>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");

    // Define a list of example timezones – feel free to extend or replace with a dynamic list
    const timezones = [
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Asia/Tokyo",
        "Australia/Sydney",
    ];

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>

            {actionData?.error && (
                <div className="alert alert-error mb-4">{actionData.error}</div>
            )}

            <Form method="post">
                <div className="form-control mb-4">
                    <label htmlFor="timeZone" className="label">
                        <span className="label-text">Select Time Zone</span>
                    </label>
                    <select
                        id="timeZone"
                        name="timeZone"
                        defaultValue={user.timeZone || "UTC"}
                        className="select select-bordered w-full"
                    >
                        {timezones.map((tz) => (
                            <option key={tz} value={tz}>
                                {tz}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={navigation.state === "submitting"}
                >
                    {navigation.state === "submitting" ? "Saving..." : "Save Settings"}
                </button>
            </Form>

            {success && (
                <p className="text-green-500 mt-4">Settings updated successfully!</p>
            )}
        </div>
    );
} 