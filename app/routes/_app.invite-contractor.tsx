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
		<div className="bg-base-200 min-h-screen p-6">
			<div className="max-w-md mx-auto">
				<h1 className="text-3xl font-bold text-primary mb-6">Invite Contractor</h1>
				
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body">
						<Form method="post" className="space-y-4">
							<div className="form-control">
								<label className="label" htmlFor="email">
									<span className="label-text">Contractor's Email</span>
								</label>
								<input
									type="email"
									id="email"
									name="email"
									className="input input-bordered w-full"
									required
								/>
							</div>
							
							<button type="submit" className="btn btn-primary w-full">
								Send Invitation
							</button>
						</Form>
						
						{actionData?.success && (
							<div className="alert alert-success mt-4">
								Invitation sent successfully!
							</div>
						)}
						
						{actionData?.error && (
							<div className="alert alert-error mt-4">
								{actionData.error}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}