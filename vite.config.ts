import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": [
            "react",
            "react-dom",
            "react-router-dom",
            "@tanstack/react-query",
          ],
          "vendor-motion": ["framer-motion"],
          "vendor-gsap": ["gsap"],
          "vendor-icons": ["lucide-react"],
          "vendor-globe": ["three", "three-globe", "react-globe.gl"],
        },
      },
    },
  },
}));
