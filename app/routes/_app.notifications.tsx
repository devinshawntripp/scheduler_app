import React from 'react';
import { json, LoaderFunction, ActionFunction } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getInvitations, acceptInvitation, declineInvitation } from '~/models/invitation.server';
import { FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { getEmailById, getUserById } from '~/models/user.server';
import { User } from '@prisma/client';

type Invitation = {
  id: string;
  email: string;
  teamOwnerId: string;
  teamOwner: User;
  createdAt: string;
  expiresAt: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const email = await getEmailById(userId) ?? '';
  try {
    let invitations = await getInvitations(email);
    invitations = await Promise.all(invitations.map(async (invitation) => {
      const teamOwner = await getUserById(invitation.teamOwnerId);
      return {
        ...invitation,
        teamOwner
      };
    }));
    return json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return json({ invitations: [] });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  const invitationId = formData.get('invitationId') as string;

  if (action === 'accept') {
    await acceptInvitation(invitationId);
  } else if (action === 'decline') {
    await declineInvitation(invitationId);
  }

  return json({ success: true });
};

export default function Notifications() {
  const { invitations } = useLoaderData<{ invitations: Invitation[] }>();
  const submit = useSubmit();

  const handleAction = (action: 'accept' | 'decline', invitationId: string) => {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('invitationId', invitationId);
    submit(formData, { method: 'post' });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">Team Invitations</h1>
      {invitations.length === 0 ? (
        <p className="text-gray-400">No team invitations at this time.</p>
      ) : (
        <ul className="space-y-4">
          {invitations.map((invitation) => (
            <li 
              key={invitation.id} 
              className="bg-gray-800 rounded-lg p-4 shadow-lg border border-blue-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <FaUserPlus className="text-blue-400 mr-3" />
                  <div>
                    <p className="font-semibold">Team Invite from: {invitation.teamOwner.email}</p>
                    <p className="text-sm text-gray-400">Expires: {new Date(invitation.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleAction('accept', invitation.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
                    title="Accept invitation"
                  >
                    <FaCheck className="inline mr-1" /> Accept
                  </button>
                  <button 
                    onClick={() => handleAction('decline', invitation.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
                    title="Decline invitation"
                  >
                    <FaTimes className="inline mr-1" /> Decline
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Received: {new Date(invitation.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}