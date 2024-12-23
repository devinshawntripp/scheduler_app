import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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

        // Clean up the origin and domains for comparison
        let cleanOrigin = origin.replace(/^https?:\/\//, '').split('/')[0];

        // Allow requests from our own domain
        if (cleanOrigin === 'schedule.devintripp.com') {
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
        }

        const cleanAllowedDomains = allowedDomains.map(domain =>
            domain.replace(/^https?:\/\//, '').split('/')[0]
        );

        const isAllowedOrigin = cleanAllowedDomains.some(domain =>
            cleanOrigin === domain
        );

        if (!isAllowedOrigin) {
            console.log('Domain check failed:', {
                cleanOrigin,
                cleanAllowedDomains,
                originalOrigin: origin,
                originalAllowedDomains: allowedDomains
            });
            return json({
                error: 'Origin not allowed',
                details: { origin: cleanOrigin, allowedDomains: cleanAllowedDomains }
            }, {
                status: 403,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                }
            });
        }

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
                :root {
                    color-scheme: none !important;
                }
                
                html, body {
                    background: transparent !important;
                    margin: 0;
                    padding: 0;
                }

                .scheduler-container {
                    background: transparent !important;
                    color-scheme: none !important;
                }

                .scheduler-container > * {
                    background: transparent !important;
                }

                .scheduler-container [data-theme] {
                    background: transparent !important;
                }

                .scheduler-container [data-theme="dark"] {
                    background: transparent !important;
                    color-scheme: none !important;
                }

                .alert {
                    background-color: rgba(255, 0, 0, 0.1) !important;
                }

                /* Override any dark theme backgrounds */
                [data-theme="dark"] .scheduler-container,
                [data-theme="dark"] .scheduler-container > * {
                    background: transparent !important;
                }

                /* Keep button styles but ensure container is transparent */
                .scheduler-container .btn {
                    background-color: inherit;
                }

                /* Ensure inputs have proper contrast */
                .scheduler-container .input {
                    background-color: rgba(255, 255, 255, 0.1);
                }
            `}</style>
            <div className="scheduler-container p-4" data-theme="light">
                {error ? (
                    <div className="p-4 text-center">
                        <div className="alert">
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
