import React, { useState } from 'react';
import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { requireUserId } from '~/utils/auth.server';
import { getUserById } from '~/models/user.server';
import { FaCopy } from 'react-icons/fa';

type LoaderData = {
    userId: string;
    apiKey: string | null;
    appUrl: string;
};

export const loader: LoaderFunction = async ({ request }) => {
    const userId = await requireUserId(request);
    const user = await getUserById(userId);

    if (!user) {
        throw new Response('User not found', { status: 404 });
    }

    return json({
        userId: user.id,
        apiKey: user.apiKey,
        appUrl: process.env.APP_URL || 'http://localhost:3000' // Provide a default value
    });
};

export default function EmbedCode() {
    const { userId, apiKey, appUrl } = useLoaderData<LoaderData>();
    const [copied, setCopied] = useState(false);

    const embedCode = `
<div id="scheduler-container"></div>
<script>
  var USER_ID = '${userId}';
  var API_KEY = '${apiKey}';
</script>
<script src="${appUrl}/embed/script"></script>
  `.trim();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(embedCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!apiKey) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Embed Code</h1>
                <p className="text-error">You need to upgrade your account to get an API key before you can embed the scheduler.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Embed Code</h1>
            <p className="mb-4">Copy and paste this code into your website where you want the scheduler to appear:</p>
            <div className="bg-base-300 p-4 rounded-lg relative">
                <pre className="whitespace-pre-wrap break-all">{embedCode}</pre>
                <button
                    onClick={copyToClipboard}
                    className="btn btn-primary absolute top-2 right-2"
                >
                    {copied ? 'Copied!' : <><FaCopy className="mr-2" /> Copy Code</>}
                </button>
            </div>
        </div>
    );
}