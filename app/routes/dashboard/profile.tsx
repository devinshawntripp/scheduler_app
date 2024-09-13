import { useLoaderData } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { getUserById } from '~/models/user.server';
import ProfileForm from '~/components/Profile/ProfileForm';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  if (!user) {
    throw new Response('Not Found', { status: 404 });
  }
  return json({ user });
};

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="bg-gray-900 shadow-lg rounded-lg p-6 border border-neon-blue">
      <h2 className="text-2xl font-bold text-neon-green mb-4">Profile</h2>
      <ProfileForm user={user} />
    </div>
  );
}