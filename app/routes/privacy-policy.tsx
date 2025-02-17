import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
    return json({});
};

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
            <p className="mb-2">Effective Date: [Insert Effective Date]</p>
            <p className="mb-4">
                Welcome to schedule-everything.com (the "Website"). This Privacy Policy
                describes how we collect, use, and disclose your information when you
                visit or use our Website. By accessing or using the Website, you
                acknowledge that you have read, understood, and agree to be bound by
                this Privacy Policy.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
            <p className="mb-4">
                We may collect personal information that you provide directly to us,
                such as when you register for an account, sign up for newsletters, fill
                out forms, or communicate with us. This information may include your
                name, email address, phone number, and other details necessary to
                provide our services.
            </p>
            <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
            <p className="mb-4">
                We use the information we collect to:
            </p>
            <ul className="list-disc list-inside mb-4">
                <li>Provide, maintain, and improve our services;</li>
                <li>Respond to your inquiries and support requests;</li>
                <li>
                    Send you updates, marketing communications, and other information;
                </li>
                <li>
                    Monitor and analyze usage and trends to improve your experience on
                    our Website.
                </li>
            </ul>
            <h2 className="text-2xl font-semibold mb-2">Sharing Your Information</h2>
            <p className="mb-4">
                We do not sell your personal information to third parties. We may share
                your information with third-party service providers who help us operate
                our Website or perform services on our behalf, provided that these
                third parties agree to keep your information confidential and use it
                only for the purposes for which we disclose it.
            </p>
            <h2 className="text-2xl font-semibold mb-2">
                Cookies and Tracking Technologies
            </h2>
            <p className="mb-4">
                We may use cookies, web beacons, and other tracking technologies to
                collect and analyze information about your usage of the Website. You can
                modify your browser settings to refuse cookies, although this may affect
                your ability to use certain features of the Website.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Your Choices</h2>
            <p className="mb-4">
                You may update, correct, or delete your personal information by
                contacting us at [Insert Contact Email]. You may also opt-out of
                receiving marketing communications by following the unsubscribe
                instructions provided in those communications.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Security</h2>
            <p className="mb-4">
                We implement reasonable security measures to protect your information
                from unauthorized access and disclosure. However, no internet
                transmission is completely secure, and we cannot guarantee the absolute
                security of your personal information.
            </p>
            <h2 className="text-2xl font-semibold mb-2">
                Changes to This Privacy Policy
            </h2>
            <p className="mb-4">
                We may update this Privacy Policy from time to time. Any changes will be
                posted on this page with an updated effective date. Your continued use
                of the Website after any changes constitutes your acceptance of the
                revised Privacy Policy.
            </p>
            <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
            <p className="mb-4">
                If you have any questions or concerns about this Privacy Policy, please
                contact us at [Insert Contact Email].
            </p>
            <p>
                <Link to="/" className="underline text-blue-500">Return to Home</Link>
            </p>
        </div>
    );
} 