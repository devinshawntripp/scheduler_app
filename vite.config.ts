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
