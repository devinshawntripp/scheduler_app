import { useLoaderData, useFetcher } from '@remix-run/react';
import { json, LoaderFunction } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { getInvitations } from '~/models/invite.server';
import { getEmailById } from '~/models/user.server';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const userId = await requireUserId(request);
    const email = await getEmailById(userId);
    if (!email) {
      throw new Error("User not found");
    }
    const notifications = await getInvitations(email);
    console.log(notifications);
    return json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

type Notification = {
  id: string;
  teamOwner: {
    email: string;
  };
  createdAt: string;
};

export default function Notifications() {
  const { notifications } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleAcceptInvitation = async (invitationId: string) => {
    fetcher.submit(
      { invitationId, action: 'accept' },
      { method: 'post', action: '/api/handle-invitation' }
    );
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    fetcher.submit(
      { invitationId, action: 'decline' },
      { method: 'post', action: '/api/handle-invitation' }
    );
  };

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-base-content">You have no notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification: Notification) => (
            <div key={notification.id} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-primary">Invitation to join team</h2>
                <p className="text-base-content">From: {notification.teamOwner.email}</p>
                <p className="text-sm text-base-content opacity-75">
                  Sent: {new Date(notification.createdAt).toLocaleDateString()}
                </p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary" onClick={() => handleAcceptInvitation(notification.id)}>Accept</button>
                  <button className="btn btn-outline btn-secondary" onClick={() => handleDeclineInvitation(notification.id)}>Decline</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}