import { cf } from "@passionware/component-factory";
import classNames from "classnames";

export type Layout = "fixed-size" | "fit-content";

export const PopoverPrimitive = cf.div<{
  layout?: Layout;
}>(
  {
    className: ({ layout = "fixed-size", className }) =>
      classNames(
        "z-10 flex flex-col items-stretch overflow-auto shadow-md rounded-lg bg-fg-surface border border-border-muted",
        "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400",
        "focus:outline-none",
        layout === "fixed-size" && "h-[400px] w-[250px]",
        className,
      ),
  },
  ["layout"],
);
