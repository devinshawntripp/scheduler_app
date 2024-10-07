import React, { useState } from 'react';
import { useFetcher } from '@remix-run/react';

interface AllowedDomainsProps {
    domains: string[];
    maxDomains: number;
}

export default function AllowedDomains({ domains, maxDomains }: AllowedDomainsProps) {
    const [newDomain, setNewDomain] = useState('');
    const fetcher = useFetcher();

    const handleAddDomain = () => {
        if (newDomain && domains.length < maxDomains) {
            fetcher.submit(
                { domain: newDomain, action: 'add' },
                { method: 'post', action: '/api/manage-domains' }
            );
            setNewDomain('');
        }
    };

    const handleRemoveDomain = (domain: string) => {
        fetcher.submit(
            { domain, action: 'remove' },
            { method: 'post', action: '/api/manage-domains' }
        );
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Allowed Domains ({domains.length}/{maxDomains})</h3>
            <ul className="mb-4">
                {domains.map((domain) => (
                    <li key={domain} className="flex justify-between items-center mb-2">
                        {domain}
                        <button onClick={() => handleRemoveDomain(domain)} className="btn btn-sm btn-error">Remove</button>
                    </li>
                ))}
            </ul>
            {domains.length < maxDomains && (
                <div className="flex">
                    <input
                        type="text"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        placeholder="Enter domain (e.g., example.com)"
                        className="input input-bordered flex-grow mr-2"
                    />
                    <button onClick={handleAddDomain} className="btn btn-primary">Add Domain</button>
                </div>
            )}
        </div>
    );
}