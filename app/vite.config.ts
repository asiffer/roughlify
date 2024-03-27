import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const base = process.env.NODE_ENV === "production" ? "/roughlify/" : "/";
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("base:", base);

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
