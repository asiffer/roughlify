import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const base = process.env.Mode === "production" ? "/roughlify/" : "/";

// https://vitejs.dev/config/
export default defineConfig({
  base: base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
