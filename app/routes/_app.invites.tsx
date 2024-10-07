import React from 'react';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getInvitationsByTeamOwner, createInvitation } from '~/models/invite.server';
import { getUserById } from '~/models/user.server';

type Invitation = {
  id: string;
  email: string;
  expiresAt: string;
  createdAt: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (user?.roles.some(role => role.name === 'team_owner')) {
    throw new Response('Forbidden', { status: 403 });
  }

  const invitations = await getInvitationsByTeamOwner(userId);
  return json({ invitations });
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await getUserById(userId);

  if (user?.roles.some(role => role.name !== 'team_owner')) {
    throw new Response('Forbidden', { status: 403 });
  }

  const formData = await request.formData();
  const email = formData.get('email') as string;

  if (!email) {
    return json({ error: 'Email is required' }, { status: 400 });
  }

  await createInvitation(userId, email);
  return json({ success: true });
};

export default function Invites() {
  const { invitations } = useLoaderData<{ invitations: Invitation[] }>();

  return (
    <div className="bg-base-200 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Contractor Invitations</h1>

      <Form method="post" className="mb-8">
        <div className="flex items-center space-x-4">
          <input
            type="email"
            name="email"
            placeholder="Contractor's email"
            className="input input-bordered flex-grow"
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
          >
            Send Invitation
          </button>
        </div>
      </Form>

      {invitations.length === 0 ? (
        <p className="text-base-content opacity-60">No invitations sent yet.</p>
      ) : (
        <ul className="space-y-4">
          {invitations.map((invitation) => (
            <li
              key={invitation.id}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg">{invitation.email}</p>
                    <p className="text-sm text-base-content opacity-60">
                      Expires: {new Date(invitation.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-base-content opacity-60">
                    Sent: {new Date(invitation.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}