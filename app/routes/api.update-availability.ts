import { ActionFunction, json } from '@remix-run/node';
import { requireUserId } from '~/utils/auth.server';
import { updateAllAvailabilities, getAvailabilityForUser } from '~/models/availability.server';

export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const action = formData.get('action');

    if (action === 'updateAllAvailabilities') {
        const availabilitiesJson = formData.get('availabilities') as string;
        const availabilities = JSON.parse(availabilitiesJson);

        try {
            await updateAllAvailabilities(userId, availabilities);
            const updatedAvailabilities = await getAvailabilityForUser(userId);
            return json({ success: true, availabilities: updatedAvailabilities });
        } catch (error) {
            return json({ error: 'Failed to update availabilities' }, { status: 400 });
        }
    } else {
        // Handle single availability update (if needed)
        const dayOfWeek = parseInt(formData.get('dayOfWeek') as string);
        const startTime = formData.get('startTime') as string;
        const endTime = formData.get('endTime') as string;

        try {
            await updateAllAvailabilities(userId, [{ dayOfWeek, startTime, endTime }]);
            const updatedAvailabilities = await getAvailabilityForUser(userId);
            return json({ success: true, availabilities: updatedAvailabilities });
        } catch (error) {
            return json({ error: 'Failed to update availability' }, { status: 400 });
        }
    }
};