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
        return json({
            error: 'Missing required parameters or origin',
            details: { userId: !!userId, apiKey: !!apiKey, origin: !!origin }
        }, { status: 400 });
    }

    try {
        await validateApiKey(apiKey);
    } catch (error) {
        console.error('API Key validation error:', error);
        return json({
            error: error instanceof Error ? error.message : 'Invalid API key',
            details: { message: error instanceof Error ? error.message : 'Unknown error' }
        }, {
            status: 403,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            }
        });
    }

    try {
        const allowedDomains = await getAllowedDomains(userId);
        const isAllowedOrigin = allowedDomains.some(domain =>
            origin.toLowerCase().includes(domain.toLowerCase())
        );

        if (!isAllowedOrigin) {
            console.error('Domain not allowed:', origin, 'Allowed domains:', allowedDomains);
            return json({
                error: 'Origin not allowed',
                details: { origin, allowedDomains }
            }, {
                status: 403,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                }
            });
        }

        await incrementUsage(apiKey);

        return json({
            userId,
            apiKey,
            isAllowed: true
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            }
        });
    } catch (error) {
        console.error('Embed scheduler error:', error);
        return json({
            error: 'Server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            }
        });
    }
};

export default function EmbeddableScheduler() {
    const { userId, apiKey, isAllowed, error, details } = useLoaderData<typeof loader>();

    return (
        <>
            <style>{`
                html, body {
                    background: transparent !important;
                    margin: 0;
                    padding: 0;
                }
                * {
                    background-color: transparent;
                }
                .input, .select, .btn {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                }
                .alert {
                    background-color: rgba(255, 0, 0, 0.1) !important;
                }
                .btn-primary {
                    background-color: rgba(79, 70, 229, 0.8) !important;
                }
                .btn-outline {
                    background-color: transparent !important;
                }
                [data-theme] {
                    background-color: transparent !important;
                }
            `}</style>
            <div style={{
                backgroundColor: 'transparent',
                background: 'transparent'
            }}>
                {error ? (
                    <div className="p-4 text-center">
                        <div className="alert" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}>
                            <h3 className="font-bold">Error</h3>
                            <p>{error}</p>
                            {details && (
                                <details className="mt-2 text-sm">
                                    <summary>Technical Details</summary>
                                    <pre className="mt-2 text-left">
                                        {JSON.stringify(details, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                ) : (
                    <EmbeddableBookingWidget userId={userId} apiKey={apiKey} />
                )}
            </div>
        </>
    );
}
