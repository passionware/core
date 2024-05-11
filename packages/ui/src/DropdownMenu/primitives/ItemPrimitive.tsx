import { cf } from "@passionware/component-factory";
import classnames from "classnames";
import { cloneElement, ReactElement } from "react";

export const ItemPrimitive = cf.div<{
  isActive?: boolean;
  colorVariant?: "normal" | "danger";
}>(
  {
    className: ({ isActive, className, colorVariant = "normal" }) =>
      classnames(
        "group/item",
        "flex flex-row items-center gap-md",
        "cursor-default select-none px-lg py-md text-sm rounded",
        "[.first-child-rounded-top-none>&]:first:rounded-t-none",
        isActive
          ? [
              {
                normal: [
                  "bg-brand-600 text-fg-surface",
                  "dark:bg-brand-200 dark:text-gray-900",
                ],
                danger: ["bg-bg-danger-emphasis text-fg-surface"],
              }[colorVariant],
            ]
          : [
              {
                normal: [
                  "bg-white text-black",
                  "dark:bg-gray-800 dark:text-gray-200",
                ],
                danger: [
                  "bg-white text-fg-danger",
                  "dark:bg-gray-800 dark:text-red-400",
                ],
              }[colorVariant],
            ],
        className,
      ),
  },
  ["isActive", "colorVariant"],
);

export function ItemPrimitiveIcon({
  children,
}: {
  children: ReactElement<{ className?: string }>;
}) {
  return cloneElement(children, {
    className: classnames(children.props.className, "w-4 h-4"),
  });
}
