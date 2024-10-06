import { json, LoaderFunction, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { retrieveCheckoutSession } from '~/services/stripe.server';
import { getUserById, updateUser } from '~/models/user.server';
import { generateApiKey } from '~/utils/apiKey.server';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
        return redirect('/payment');
    }

    const session = await retrieveCheckoutSession(sessionId);
    const userId = session.client_reference_id;

    if (!userId) {
        throw new Error('User ID not found in session');
    }

    const user = await getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const apiKey = generateApiKey();
    const tier = session.amount_total >= 2000 ? 'pro' : 'basic';

    await updateUser(userId, { apiKey, tier });

    return json({ success: true, tier, apiKey });
};

export default function PaymentSuccess() {
    const { tier, apiKey } = useLoaderData<typeof loader>();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
            <p className="mb-2">Your account has been upgraded to: {tier}</p>
            <p className="mb-4">Your API Key: {apiKey}</p>
            <p>Please save this API key as it won't be shown again.</p>
        </div>
    );
}