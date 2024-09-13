import { json, ActionFunction } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { requireUserId } from '../utils/auth.server';
import { prisma } from '~/db.server';
import { sendInvitationEmail } from '~/utils/email.server';

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user?.role !== 'team_owner') {
    return json({ error: 'Only team owners can invite contractors' }, { status: 403 });
  }

  const formData = await request.formData();
  const email = formData.get('email') as string;

  if (!email) {
    return json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          invitedByTeamOwner: userId,
          hasUnreadInvitation: true
        }
      });

      await sendInvitationEmail(email, existingUser.id);

      return json({ success: true, message: 'Invitation sent to existing user' });
    } else {
      const invitation = await prisma.invitation.create({
        data: {
          email,
          teamOwner: { connect: { id: userId } },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });

      await sendInvitationEmail(email, invitation.id);

      return json({ success: true, message: 'Invitation sent to new user' });
    }
  } catch (error) {
    console.error('Failed to create invitation:', error);
    return json({ error: 'Failed to create invitation' }, { status: 500 });
  }
};

export default function InviteContractor() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Invite Contractor</h2>
      <Form method="post">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Contractor's Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Send Invitation
        </button>
      </Form>
      {actionData?.error && (
        <p className="mt-2 text-red-600">{actionData.error}</p>
      )}
      {actionData?.success && (
        <p className="mt-2 text-green-600">Invitation sent successfully!</p>
      )}
    </div>
  );
}