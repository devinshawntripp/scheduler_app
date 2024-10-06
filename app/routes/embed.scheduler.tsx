import React from 'react';
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import EmbeddableBookingWidget from '~/components/EmbeddableBookingWidget/EmbeddableBookingWidget';
import { validateApiKey, incrementUsage } from '~/utils/auth.server'; // You'll need to implement this function

type LoaderData = {
    userId: string;
};

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const apiKey = url.searchParams.get('apiKey');

    if (!userId || !apiKey) {
        return json({ error: 'User ID and API key are required' }, { status: 400 });
    }

    const isValidApiKey = await validateApiKey(apiKey);
    if (!isValidApiKey) {
        return json({ error: 'Invalid API key or usage limit exceeded' }, { status: 403 });
    }

    await incrementUsage(apiKey);

    return json({ userId });
};

export default function EmbeddableScheduler() {
    const { userId } = useLoaderData<LoaderData>();

    if (!userId) {
        return <div>Error: User ID is required</div>;
    }

    return (
        <div className="embeddable-scheduler p-4">
            <EmbeddableBookingWidget userId={userId} apiKey={userId.apiKey} />
        </div>
    );
}