import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
      routes(defineRoutes) {
        return defineRoutes((route) => {
          route("/api/employees", "routes/api/employees.ts");
          route("/api/events", "routes/api/events.ts");
          route("/api/bookings", "routes/api/bookings.ts");
          route("/api/create-contractor", "routes/api/create-contractor.ts"); // Add this line
          route("/embed/scheduler", "routes/embed.scheduler.tsx");
          route("/embed/script", "routes/embed.script.tsx");
          route("/embed-test", "routes/_app.embed-test.tsx");
          route("/api/available-times", "routes/api.available-times.ts");
          route("/embed-code", "routes/_app.embed-code.tsx");
          route("/register", "routes/register.tsx");
        });
      },
    }),
    tsconfigPaths()
  ],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    host: true,
  },
});
