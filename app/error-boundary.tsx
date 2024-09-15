import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { Links, Meta, Scripts } from "@remix-run/react";

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <html lang="en" className="h-full dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full bg-gray-900 text-white">
        {isRouteErrorResponse(error) ? (
          <div>
            <h1>
              {error.status} {error.statusText}
            </h1>
            <p>{error.data}</p>
          </div>
        ) : error instanceof Error ? (
          <div>
            <h1>Error</h1>
            <p>{error.message}</p>
            <p>The stack trace is:</p>
            <pre>{error.stack}</pre>
          </div>
        ) : (
          <h1>Unknown Error</h1>
        )}
        <Scripts />
      </body>
    </html>
  );
}