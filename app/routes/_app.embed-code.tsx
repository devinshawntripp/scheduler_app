import React, { useState } from 'react';
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getUserById, getAllowedDomains, getDomainLimitByTier } from '~/models/user.server';
import { FaCopy } from 'react-icons/fa';
import AllowedDomains from '~/components/AllowedDomains';
import Layout from '~/components/Layout/Layout';  // Import the Layout component

type LoaderData = {
    userId: string;
    apiKey: string | null;
    appUrl: string;
    allowedDomains: string[];
    maxDomains: number;
    tier: string;
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);
    const allowedDomains = await getAllowedDomains(userId);

    if (!user) {
        throw new Response('User not found', { status: 404 });
    }

    const maxDomains = getDomainLimitByTier(user.tier);

    return json({
        userId: user.id,
        apiKey: user.apiKey,
        appUrl: process.env.APP_URL || 'http://localhost:3000',
        allowedDomains,
        maxDomains,
        tier: user.tier,
    });
};

export default function EmbedCode() {
    const { userId, apiKey, appUrl, allowedDomains, maxDomains } = useLoaderData<LoaderData>();
    const [copied, setCopied] = useState(false);

    const embedCode = `
<iframe
  src="${appUrl}/embed/scheduler?userId=${userId}&apiKey=${apiKey}"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
    `.trim();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const content = (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Embed Code</h1>
            {!apiKey ? (
                <>
                    <p className="text-error">You need to upgrade your account to get an API key before you can embed the scheduler.</p>
                    <Link to="/payment" className="btn btn-primary mt-4">Upgrade Account</Link>
                </>
            ) : (
                <>
                    <AllowedDomains domains={allowedDomains} maxDomains={maxDomains} />
                    <p className="my-4">Copy and paste this code into your website where you want the scheduler to appear:</p>
                    <div className="bg-base-300 p-4 rounded-lg relative">
                        <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
                        <button
                            onClick={copyToClipboard}
                            className="btn btn-primary absolute top-2 right-2"
                        >
                            {copied ? 'Copied!' : <><FaCopy className="mr-2" /> Copy Code</>}
                        </button>
                    </div>
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>Copy the code above and paste it into your website's HTML where you want the scheduler to appear.</li>
                            <li>The scheduler will appear in an iframe with a width of 100% and a height of 600 pixels.</li>
                            <li>You can adjust the height value in the iframe tag if needed.</li>
                            <li>Ensure that you have sufficient width on your page for the scheduler to display properly.</li>
                            <li>Make sure your website's domain is added to the list of allowed domains above.</li>
                        </ol>
                    </div>
                </>
            )}
        </div>
    );

    // Wrap the content with the Layout component
    return <Layout>{content}</Layout>;
}