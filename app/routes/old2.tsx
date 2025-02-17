import { LoaderFunction, json } from "@remix-run/node";
import { Link, useRouteError } from "@remix-run/react";

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({});
};

export default function NotFound() {
  const error = useRouteError();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      <pre className="text-red-500 mb-8">{JSON.stringify(error, null, 2)}</pre>
      <Link
        to="/"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}