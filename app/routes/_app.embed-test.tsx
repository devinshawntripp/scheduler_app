import React from 'react';
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import EmbeddableBookingWidget from '~/components/EmbeddableBookingWidget/EmbeddableBookingWidget';
import { requireUserId } from '~/utils/auth.server';
import { getUserById } from '~/models/user.server';
import Layout from '~/components/Layout/Layout';

type LoaderData = {
    userId: string;
    apiKey: string | null;
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);

    if (!user) {
        throw new Response('User not found', { status: 404 });
    }

    return json({ userId: user.id, apiKey: user.apiKey });
};

export default function EmbedTest() {
    const { userId, apiKey } = useLoaderData<LoaderData>();

    if (!apiKey) {
        return (
            <div>
                <p>Error: API key not set for this user</p>
                <Link to="/payment" className="text-blue-500 underline">
                    Upgrade your account to get an API key
                </Link>
            </div>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Embeddable Booking Widget Test</h1>
                <div className="border p-4 rounded-lg">
                    <EmbeddableBookingWidget userId={userId} apiKey={apiKey} />
                </div>
            </div>
        </Layout>
    );
}