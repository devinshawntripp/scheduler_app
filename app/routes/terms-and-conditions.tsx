import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
    return json({});
};

export default function TermsAndConditions() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Terms and Conditions</h1>
            <p className="mb-2">Effective Date: [Insert Effective Date]</p>
            <p className="mb-4">
                Welcome to schedule-everything.com (the "Website"). These Terms and
                Conditions ("Terms") govern your use of our Website. By accessing or
                using the Website, you agree to be bound by these Terms.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Use of the Website</h2>
            <p className="mb-4">
                You agree to use the Website only for lawful purposes and in accordance
                with these Terms. You are responsible for your use of the Website and any
                content you provide.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Intellectual Property</h2>
            <p className="mb-4">
                All content on the Website, including text, graphics, logos, and images,
                is the property of schedule-everything.com or its licensors and is
                protected by applicable intellectual property laws.
            </p>
            <h2 className="text-2xl font-semibold mb-2">User Responsibilities</h2>
            <p className="mb-4">
                You agree not to misuse the Website, including but not limited to:
            </p>
            <ul className="list-disc list-inside mb-4">
                <li>Interfering with the operation of the Website;</li>
                <li>Collecting or harvesting personal data;</li>
                <li>Engaging in any activity that is illegal or unauthorized.</li>
            </ul>
            <h2 className="text-2xl font-semibold mb-2">Limits of Liability</h2>
            <p className="mb-4">
                To the fullest extent permitted by law, schedule-everything.com shall not
                be liable for any damages arising from your use of the Website.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Changes to These Terms</h2>
            <p className="mb-4">
                We reserve the right to modify these Terms at any time. Your continued use
                of the Website after any changes signifies your acceptance of the new
                Terms.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Governing Law</h2>
            <p className="mb-4">
                These Terms are governed by and construed in accordance with the laws
                applicable to schedule-everything.com.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
            <p className="mb-4">
                If you have any questions regarding these Terms, please contact us at
                [Insert Contact Email].
            </p>
            <p>
                <Link to="/" className="underline text-blue-500">
                    Return to Home
                </Link>
            </p>
        </div>
    );
} 