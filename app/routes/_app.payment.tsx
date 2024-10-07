import { json, LoaderFunction, ActionFunction, redirect } from '@remix-run/node';
import { useLoaderData, Form } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getUserById } from '~/models/user.server';
import { createCheckoutSession, getActiveSubscription } from '~/services/stripe.server';
import { FaCheck } from 'react-icons/fa';

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);
    if (!user) throw new Error('User not found');

    const activeSubscription = await getActiveSubscription(user.stripeCustomerId);

    return json({ user, activeSubscription });
};

export const action: ActionFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const priceId = formData.get('priceId') as string;

    if (!priceId) throw new Error('Price ID is required');

    const session = await createCheckoutSession(priceId, userId);
    return redirect(session.url!);
};

export default function Payment() {
    const { user, activeSubscription } = useLoaderData<typeof loader>();

    const plans = [
        {
            name: 'Basic',
            price: '$10',
            priceId: 'price_1Q6PoUQaM3W31xcMSMtwU8Ch',
            features: ['50 bookings per month', 'Basic support', 'Standard widget customization'],
        },
        {
            name: 'Pro',
            price: '$20',
            priceId: 'price_1Q6PpBQaM3W31xcMGQJRM95z',
            features: ['500 bookings per month', 'Priority support', 'Advanced widget customization', 'Analytics dashboard'],
        },
        {
            name: 'Ultimate',
            price: '$50',
            priceId: 'price_1Q6Pq3QaM3W31xcMY17mpR72',
            features: ['Unlimited bookings', '24/7 VIP support', 'Full widget customization', 'Advanced analytics', 'API access'],
        },
    ];

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Upgrade Your Plan</h1>
            <p className="mb-8 text-center">Current plan: <span className="font-semibold">{user.tier}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div key={plan.name} className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title text-2xl font-bold mb-4">{plan.name}</h2>
                            <p className="text-3xl font-bold mb-6">{plan.price}<span className="text-sm font-normal">/month</span></p>
                            <ul className="mb-6">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center mb-2">
                                        <FaCheck className="text-success mr-2" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Form method="post">
                                <input type="hidden" name="priceId" value={plan.priceId} />
                                <button
                                    type="submit"
                                    className={`w-full btn ${activeSubscription && user.tier === plan.name.toLowerCase() ? 'btn-disabled' : 'btn-primary'}`}
                                    disabled={activeSubscription && user.tier === plan.name.toLowerCase()}
                                >
                                    {activeSubscription && user.tier === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade'}
                                </button>
                            </Form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}