import { cf } from "@passionware/component-factory";
import classNames from "classnames";

export const RadioButtonPrimitive = cf.div<{ checked?: boolean }>(
  {
    className: ({ checked, className }) =>
      classNames(
        "w-4 h-4 border rounded-full flex flex-row items-center justify-center",
        checked
          ? [
              "group-data-[active=true]/item:border-neutral-200 bg-zinc-900 border-zinc-900",
              "dark:group-data-[active=true]/item:border-neutral-800 dark:bg-zinc-200 dark:border-zinc-200",
            ]
          : [
              "group-data-[active=true]/item:border-zinc-900 bg-white border-neutral-200",
              "dark:group-data-[active=true]/item:border-zinc-200 dark:bg-gray-800 dark:border-zinc-600",
            ],
        className,
      ),
    children: ({ checked }) =>
      checked ? (
        <div className="w-2 h-2 bg-white dark:bg-gray-900 rounded-full" />
      ) : null,
  },
  ["checked"],
);
