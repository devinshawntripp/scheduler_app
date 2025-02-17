import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getUserById, updateUser, addTeamOwnerIdToUser } from '~/services/user.server';
import { getAvailabilityForUser } from '~/services/availability.server';
import AvailabilityManager from '~/components/Profile/AvailabilityManager';
import { User, UserRole } from '@prisma/client';
export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user: User | null = await getUserById(userId);
  const availability = await getAvailabilityForUser(userId);
  if (!user) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ user, availability });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Handle setting the teamOwnerId if the intent is provided
  if (intent === "set-team-owner-id") {
    await addTeamOwnerIdToUser(userId, userId);
    return json({ success: true, message: "Team Owner ID set." });
  }

  const email = formData.get('email') as string;
  // const name = formData.get('name') as string;

  try {
    await updateUser(userId, { email });
    return json({ success: true });
  } catch (error) {
    return json({ error: 'Failed to update profile' }, { status: 400 });
  }
};

export default function Profile() {
  const { user, availability } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Profile</h1>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Personal Information</h2>
            <Form method="post" className="space-y-4">
              <div className="form-control">
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={user.email}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label" htmlFor="name">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={user.name || ''}
                  className="input input-bordered w-full"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full">
                Update Profile
              </button>
            </Form>

            {actionData?.success && (
              <div className="alert alert-success mt-4">
                Profile updated successfully!
              </div>
            )}

            {actionData?.error && (
              <div className="alert alert-error mt-4">
                {actionData.error}
              </div>
            )}
          </div>
        </div>

        <AvailabilityManager availabilities={availability} />

        {user.roles.some((role: UserRole) => role.name === 'team_owner') && !user.teamOwnerId && (
          <div className="mt-8 p-4 border border-yellow-300 rounded">
            <p className="text-yellow-700 mb-2">
              Your profile has the "team_owner" role but your Team Owner ID is not set.
              Click the button below to set it.
            </p>
            <Form method="post">
              <input type="hidden" name="intent" value="set-team-owner-id" />
              <button type="submit" className="btn btn-warning">
                Set Team Owner ID
              </button>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}