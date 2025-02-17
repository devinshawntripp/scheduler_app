import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  useSearchParams,
  useLocation,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import Layout from "./components/Layout/Layout";
import { getUserById } from "./services/user.server";
import { AuthProvider } from "./context/AuthContext";
import { requireUserId, getUserId } from "./utils/auth.server";
import { ExtendedUser } from "./models";
import { rehydrateExtendedUser } from "./utils/rehydrateUser";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/tailwind.css" },
];

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const isEmbedded = url.searchParams.get("embedded") === "true";

  // Add a list of public routes that should not require authentication.
  const publicRoutes = ["/login", "/register"];

  if (isEmbedded) {
    return json({});
  }

  // If the current pathname is public, do not enforce authentication.
  if (publicRoutes.includes(url.pathname)) {
    return json({
      user: null,
      ENV: { APP_TIME_ZONE: process.env.APP_TIME_ZONE || "America/Chicago" },
    });
  }

  const userId = await requireUserId(request);
  const user = await getUserById(userId);
  return json({
    user,
    ENV: { APP_TIME_ZONE: process.env.APP_TIME_ZONE || "America/Chicago" },
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  // const isEmbedded = typeof window !== 'undefined' && window.location.pathname.startsWith('/embed');
  // const loaderData = useLoaderData<{ user?: ExtendedUser }>();
  const [searchParams] = useSearchParams();
  const isEmbedded = searchParams.get("embedded") === "true";
  const location = useLocation();

  // Use the rehydrateExtendedUser helper if a user is present.
  const user: ExtendedUser | null =
    isEmbedded || !data.user ? null : rehydrateExtendedUser(data.user);
  const noLayoutRoutes = ["/login", "/register"];
  const isNoLayout = noLayoutRoutes.includes(location.pathname);

  return (
    <html lang="en" className={isEmbedded ? '' : 'h-full dark'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={isEmbedded ? 'bg-transparent' : 'h-full bg-base-200'}>
        <AuthProvider user={data.user}>
          {isNoLayout ? <Outlet /> : <Layout user={data.user}><Outlet /></Layout>}
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
          }}
        />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const location = useLocation();

  const noLayoutRoutes = ["/login", "/register"];
  const isNoLayout = noLayoutRoutes.includes(location.pathname);

  let errorContent;
  if (isRouteErrorResponse(error)) {
    errorContent = (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">
          {error.status} {error.statusText || "Error"}
        </h1>
        <p className="mb-4">
          {error.data || "Sorry, an error occurred."}
        </p>
        <p>Please try refreshing the page, or contact support if the problem persists.</p>
      </div>
    );
  } else if (error instanceof Error) {
    errorContent = (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">An unexpected error occurred</h1>
        <p className="mb-4">{error.message}</p>
        <pre className="bg-gray-800 p-4 rounded overflow-x-auto">{error.stack}</pre>
        <p className="mt-4">Please try refreshing the page, or contact support.</p>
      </div>
    );
  } else {
    errorContent = <h1 className="text-3xl font-bold">Unknown Error</h1>;
  }

  return (
    <html lang="en" className="h-full dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-900 text-white">
        <Layout user={null}>
          <div className="container mx-auto text-center">
            {errorContent}
            <button
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </Layout>
        <Scripts />
      </body>
    </html>
  );
}

