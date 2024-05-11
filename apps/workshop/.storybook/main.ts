import type { StorybookConfig } from "@storybook/react-vite";

import { dirname, join } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: [
    {
      directory: "../../../",
      files: "*/*/src/**/*.stories.@(mdx|js|jsx|mjs|ts|tsx)",
    },
  ],
  addons: [
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-links"),
    {
      name: "@storybook/addon-essentials",
      options: {
        backgrounds: false, // 👈 disable the backgrounds addon
      },
    },
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
