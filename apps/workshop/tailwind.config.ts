import { theme } from "@passionware/tailwind-config";
import containerPlugin from "@tailwindcss/container-queries";
import formsPlugin from "@tailwindcss/forms";
import { Config } from "tailwindcss";

export default {
  content: ["../../packages/*/src/**/*.{tsx,ts,jsx,js,html}"],
  darkMode: "class",
  theme: {
    extend: theme,
  },
  plugins: [formsPlugin, containerPlugin],
} satisfies Config;
