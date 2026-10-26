import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "src",
  base: "/virtual-universe-26/",
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",
  },
});
