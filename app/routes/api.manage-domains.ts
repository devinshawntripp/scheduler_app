import { ActionFunction, json } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { addAllowedDomain, removeAllowedDomain, getAllowedDomains, getUserById } from '~/models/user.server';

export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const action = formData.get('action');
    const domain = formData.get('domain');

    if (typeof domain !== 'string') {
        return json({ error: 'Invalid domain' }, { status: 400 });
    }

    try {
        const user = await getUserById(userId);
        if (!user) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        if (action === 'add') {
            await addAllowedDomain(userId, domain);
        } else if (action === 'remove') {
            await removeAllowedDomain(userId, domain);
        }

        const updatedDomains = await getAllowedDomains(userId);
        return json({ domains: updatedDomains, tier: user.tier });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
};