import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import vitePluginSvgr from "vite-plugin-svgr";
import "vitest/suite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginSvgr({ include: "**/*.svg?react", svgrOptions: { icon: true } }),
  ],
  test: {
    setupFiles: __dirname + "/setupTests.ts",
  },
});
