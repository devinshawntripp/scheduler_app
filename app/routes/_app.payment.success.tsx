import { json, LoaderFunction, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getCheckoutSession } from '~/services/stripe.server';
import { getUserById, updateUser } from '~/models/user.server';
import { generateApiKey } from '~/utils/apiKey.server';
import { requireUserId } from '~/utils/auth.server';

type LoaderData = {
    success: boolean;
    message: string;
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
        return redirect('/payment?error=Missing session ID');
    }

    try {
        const session = await getCheckoutSession(sessionId);
        const user = await getUserById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        if (session.status === 'complete') {
            // Determine the tier based on the price ID
            let tier = 'basic';
            if (session.line_items?.data[0]?.price?.id === 'price_YYYYY') {
                tier = 'pro';
            } else if (session.line_items?.data[0]?.price?.id === 'price_ZZZZZ') {
                tier = 'ultimate';
            }

            // Generate API key if not exists
            const apiKey = user.apiKey || generateApiKey();

            // Update user with new tier, active subscription, and API key
            await updateUser(userId, {
                tier,
                activeSubscription: true,
                apiKey,
                stripeCustomerId: session.customer as string,
            });

            return json<LoaderData>({
                success: true,
                message: `Successfully upgraded to ${tier} plan!`,
            });
        } else {
            return json<LoaderData>({
                success: false,
                message: 'Payment was not completed.',
            });
        }
    } catch (error) {
        console.error('Error processing payment success:', error);
        return json<LoaderData>({
            success: false,
            message: 'An error occurred while processing your payment.',
        });
    }
};

export default function PaymentSuccess() {
    const { success, message } = useLoaderData<LoaderData>();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Payment {success ? 'Successful' : 'Failed'}</h1>
            <p className={`text-lg ${success ? 'text-success' : 'text-error'}`}>{message}</p>
            <a href="/dashboard" className="btn btn-primary mt-4">Return to Dashboard</a>
        </div>
    );
}