import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "widget-ccat-react-ts": path.resolve(__dirname, "../src"),
      "@": path.resolve(__dirname, "../src"),
      "@components": path.resolve(__dirname, "../src/components"),
      "@stores": path.resolve(__dirname, "../src/stores"),
      "@hooks": path.resolve(__dirname, "../src/hooks"),
      "@models": path.resolve(__dirname, "../src/models"),
      "@utils": path.resolve(__dirname, "../src/utils"),
    },
  },
  publicDir: path.resolve(__dirname, "../dist"),
  optimizeDeps: {
    exclude: ["widget-ccat-react-ts"],
  },
});
