import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // React Flow + framer-motion make up most of the bundle; a single chunk is fine for this small static app.
    chunkSizeWarningLimit: 700,
  },
});
