import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const src = fileURLToPath(new URL("../src", import.meta.url));

export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@linesight/kit": src } },
  server: { port: 5190, strictPort: true },
  build: { outDir: "dist", emptyOutDir: true },
});
