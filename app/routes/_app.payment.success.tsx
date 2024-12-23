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
        console.log('Processing payment success for session:', sessionId);
        const session = await getCheckoutSession(sessionId);
        console.log('Stripe session:', session);

        const user = await getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (session.status === 'complete' || session.payment_status === 'paid') {
            // Determine the tier based on the price ID
            let tier = 'basic';
            const priceId = session.line_items?.data[0]?.price?.id;
            console.log('Price ID:', priceId);

            if (priceId === 'price_1Q6PpBQaM3W31xcMGQJRM95z') {
                tier = 'pro';
            } else if (priceId === 'price_1Q6Pq3QaM3W31xcMY17mpR72') {
                tier = 'ultimate';
            }

            console.log('Upgrading user to tier:', tier);

            // Generate API key if not exists
            const apiKey = user.apiKey || generateApiKey();

            // Get just the customer ID string
            const stripeCustomerId = typeof session.customer === 'string'
                ? session.customer
                : session.customer?.id;

            if (!stripeCustomerId) {
                throw new Error('No customer ID found in session');
            }

            // Update user with new tier, active subscription, and API key
            await updateUser(userId, {
                tier,
                activeSubscription: true,
                apiKey,
                stripeCustomerId,
            });

            console.log('User updated successfully');

            return json<LoaderData>({
                success: true,
                message: `Successfully upgraded to ${tier} plan!`,
            });
        } else {
            console.log('Payment not completed. Session status:', session.status);
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