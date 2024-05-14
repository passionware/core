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
                  "bg-brand-600 text-white",
                  "dark:bg-brand-200 dark:text-gray-900",
                ],
                danger: ["bg-bg-danger-emphasis text-white"],
              }[colorVariant],
            ]
          : [
              {
                normal: [
                  "bg-white text-black aria-disabled:text-gray-500",
                  "dark:bg-gray-800 dark:text-gray-200 dark:aria-disabled:text-gray-500",
                ],
                danger: [
                  "bg-white text-red-500 aria-disabled:text-gray-500",
                  "dark:bg-gray-800 dark:text-red-400 dark:aria-disabled:text-gray-500",
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

export const ItemSecondaryText = cf.div({
  className:
    "text-gray-500 text-xs [[data-active=true]_&]:text-gray-500 dark:text-gray-400 dark:[[data-active=true]_&]:text-gray-500",
});
