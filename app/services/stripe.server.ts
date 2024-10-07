import Stripe from 'stripe';
import { getUserById, updateUser } from '~/models/user.server';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY must be defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // Use the latest stable API version
});

export async function createCheckoutSession(priceId: string, userId: string) {
    const user = await getUserById(userId);
    if (!user) throw new Error('User not found');

    let customer;
    if (user.stripeCustomerId) {
        customer = user.stripeCustomerId;
    } else {
        const newCustomer = await stripe.customers.create({
            email: user.email,
            metadata: { userId: user.id },
        });
        customer = newCustomer.id;
        await updateUser(userId, { stripeCustomerId: customer });
    }

    const session = await stripe.checkout.sessions.create({
        customer,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/payment`,
    });

    return session;
}

export async function getActiveSubscription(stripeCustomerId: string | null) {
    if (!stripeCustomerId) return null;

    const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
        limit: 1,
    });

    return subscriptions.data[0] || null;
}

export async function getCheckoutSession(sessionId: string) {
    return stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items'],
    });
}