import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: "/PKlab/",
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  plugins: [react(), tailwindcss(), viteSingleFile()],
  // The Vite entry template lives at `index.source.html`; the repo-root
  // `index.html` is the PROMOTED production build that GitHub Pages serves
  // (Pages deploys the root of `main`, and the build is a self-contained
  // single file). `npm run build` regenerates it via the promote step.
  build: {
    rollupOptions: {
      input: { index: path.resolve(__dirname, "index.source.html") },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
