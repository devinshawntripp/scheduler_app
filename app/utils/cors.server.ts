import type { LoaderFunction } from "@remix-run/node";

export function corsMiddleware(handler: LoaderFunction): LoaderFunction {
    return async (args) => {
        const response = await handler(args);

        if (!(response instanceof Response)) {
            return response;
        }

        const headers = new Headers(response.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
        headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    };
}