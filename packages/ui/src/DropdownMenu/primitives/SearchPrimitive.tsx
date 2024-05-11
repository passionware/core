import { cf } from "@passionware/component-factory";
import classNames from "classnames";

export const SearchPrimitive = cf.input({
  className: classNames(
    "w-full border border-border-muted rounded text-sm text-fg-default placeholder-fg-muted",
    "focus:outline-none focus:ring-0 focus:border-border-default",
    "dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:focus:border-gray-600",
  ),
});
