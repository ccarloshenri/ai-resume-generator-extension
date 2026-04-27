import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Chrome extension build: two separate entry points.
// The popup runs as a normal React SPA.
// The content script runs in the page context and must be a plain IIFE bundle.
export default defineConfig({
  plugins: [react()],
  // Chrome extensions load resources relative to the extension root,
  // not from an absolute path. Setting base to "./" ensures all asset
  // references in popup.html are relative.
  base: "./",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        content: resolve(__dirname, "src/content/jobScanner.ts"),
      },
      output: {
        // Each entry gets its own predictable file name.
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "content") {
            return "content/jobScanner.js";
          }
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
});
