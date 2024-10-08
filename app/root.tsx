import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";


export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/tailwind.css" },
];

export const loader: LoaderFunction = async () => {
  return json({
    ENV: {
      APP_TIME_ZONE: process.env.APP_TIME_ZONE || 'America/Chicago',
    },
  });
};

export default function App() {
  const data = useLoaderData<typeof loader>();
  const isEmbedded = typeof window !== 'undefined' && window.location.pathname.startsWith('/embed');


  return (
    <html lang="en" className="h-full dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={isEmbedded ? '' : 'h-full bg-base-200'}>
        <Outlet />
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

