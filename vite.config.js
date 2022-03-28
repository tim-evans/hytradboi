import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  mode: "development",
  build: {
    outDir: "build",
    minify: false,
    target: "esnext",
  },
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
  optimizeDeps: {
    include: ["uuid-random"],
    exclude: ["@atjson/document"],
  },
  server: {
    proxy: {
      "/api": {
        target: "https://en.wikipedia.org/w/api.php",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
