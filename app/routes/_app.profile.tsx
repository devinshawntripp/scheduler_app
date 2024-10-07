import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useActionData, Form } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getUserById, updateUser } from '~/models/user.server';
import { getAvailabilityForUser } from '~/models/availability.server';
import AvailabilityManager from '~/components/Profile/AvailabilityManager';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  const availability = await getAvailabilityForUser(userId);
  if (!user) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ user, availability });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  try {
    await updateUser(userId, { email, name });
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
      </div>
    </div>
  );
}