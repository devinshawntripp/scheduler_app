import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { incrementUsage } from '~/utils/auth.server';
import { validateApiKey } from '~/utils/apiKey.server';
import { getAllowedDomains } from '~/models/user.server';
import EmbeddableBookingWidget from '~/components/EmbeddableBookingWidget/EmbeddableBookingWidget';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const apiKey = url.searchParams.get('apiKey');
    const origin = request.headers.get('Origin') || request.headers.get('Referer');

    if (!userId || !apiKey || !origin) {
        return json({ error: 'Missing required parameters or origin' }, { status: 400 });
    }

    const isValidApiKey = await validateApiKey(apiKey);
    if (!isValidApiKey) {
        return json({ error: 'Invalid API key or usage limit exceeded' }, { status: 403 });
    }

    const allowedDomains = await getAllowedDomains(userId);
    const isAllowedOrigin = allowedDomains.some(domain => origin.includes(domain));

    if (!isAllowedOrigin) {
        return json({ error: 'Origin not allowed' }, { status: 403 });
    }

    await incrementUsage(apiKey);

    return json({ userId, apiKey, isAllowed: true });
};

export default function EmbeddableScheduler() {
    const { userId, apiKey, isAllowed, error } = useLoaderData<typeof loader>();

    // Add a style tag to ensure transparency
    return (
        <>
            <style>{`
                html, body {
                    background: transparent !important;
                    margin: 0;
                    padding: 0;
                }
            `}</style>
            <div style={{ background: 'transparent' }}>
                {!isAllowed ? (
                    <div className="p-4 text-center">
                        <p className="text-error">{error || 'This domain is not authorized to embed the scheduler.'}</p>
                    </div>
                ) : (
                    <EmbeddableBookingWidget userId={userId} apiKey={apiKey} />
                )}
            </div>
        </>
    );
}
