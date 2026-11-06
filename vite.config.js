import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // React Flow, framer-motion and the content of five domains make up the bundle (about 275 kB gzipped).
    // A single chunk is fine for this static app, so the size warning limit is raised.
    chunkSizeWarningLimit: 900,
  },
});
