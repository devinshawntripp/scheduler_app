import { ActionFunction, json } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { acceptInvitation, declineInvitation } from '~/models/invite.server';

export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const invitationId = formData.get('invitationId') as string;
    const action = formData.get('action') as string;

    try {
        if (action === 'accept') {
            await acceptInvitation(invitationId);
        } else if (action === 'decline') {
            await declineInvitation(invitationId);
        } else {
            throw new Error('Invalid action');
        }
        return json({ success: true });
    } catch (error) {
        return json({ error: error.message }, { status: 400 });
    }
};