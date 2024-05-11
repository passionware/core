import { ComponentProps } from "react";
import classNames from "classnames";
import { cf } from "@passionware/component-factory";

const styleConfig = {
  primary: {
    enabled: classNames(
      "focus:bg-gray-800/5 aria-expanded:bg-gray-800/5 focus:dark:bg-gray-200/5 aria-expanded:dark:bg-gray-200/5 dark:text-gray-300 text-gray-800",
      "aria-selected:bg-brand-500 aria-selected:dark:bg-brand-600 aria-selected:text-white aria-selected:dark:text-white aria-selected:focus:bg-brand-600 aria-selected:focus:dark:bg-brand-500",
    ),
    disabled: "cursor-default dark:text-gray-600 text-gray-400",
  },
  danger: {
    enabled: classNames(
      "focus:bg-red-800/5 aria-expanded:bg-red-800/5 focus:dark:bg-red-200/5 aria-expanded:dark:bg-red-200/5 dark:text-red-300 text-red-800",
      "aria-selected:bg-red-500 aria-selected:dark:bg-red-600 aria-selected:text-white aria-selected:dark:text-white aria-selected:focus:bg-red-600 aria-selected:focus:dark:bg-red-500",
    ),
    disabled: "cursor-default dark:text-red-600 text-red-400",
  },
  warning: {
    enabled: classNames(
      "focus:bg-yellow-800/5 aria-expanded:bg-yellow-800/5 focus:dark:bg-yellow-200/5 aria-expanded:dark:bg-yellow-200/5 dark:text-yellow-300 text-yellow-800",
      "aria-selected:bg-amber-500 aria-selected:dark:bg-amber-600 aria-selected:text-white aria-selected:dark:text-white aria-selected:focus:bg-amber-600 aria-selected:focus:dark:bg-amber-500",
    ),
    disabled: "cursor-default dark:text-yellow-600 text-yellow-400",
  },
  success: {
    enabled: classNames(
      "focus:bg-green-800/5 aria-expanded:bg-green-800/5 focus:dark:bg-green-200/5 aria-expanded:dark:bg-green-200/5 dark:text-green-300 text-green-800",
      "aria-selected:bg-green-500 aria-selected:dark:bg-green-600 aria-selected:text-white aria-selected:dark:text-white aria-selected:focus:bg-green-600 aria-selected:focus:dark:bg-green-500",
    ),
    disabled: "cursor-default dark:text-green-600 text-green-400",
  },
  secondary: {
    enabled: classNames(
      "focus:bg-gray-800/5 aria-expanded:bg-gray-800/5 focus:dark:bg-gray-200/5 aria-expanded:dark:bg-gray-200/5 dark:text-gray-300 text-gray-800",
      "aria-selected:bg-gray-500 aria-selected:dark:bg-gray-600 aria-selected:text-white aria-selected:dark:text-white aria-selected:focus:bg-gray-600 aria-selected:focus:dark:bg-gray-500",
    ),
    disabled: "cursor-default dark:text-gray-600 text-gray-400",
  },
};

const descriptionConfig = {
  primary:
    "text-gray-400 dark:text-gray-300 group-aria-selected:text-white dark:group-aria-selected:text-white dark:group-focus:text-gray-200",
  danger:
    "text-red-950 dark:text-red-300 group-aria-selected:text-white dark:group-aria-selected:text-white dark:group-focus:text-red-200",
  warning:
    "text-amber-950 dark:text-yellow-300 group-aria-selected:text-white dark:group-aria-selected:text-white dark:group-focus:text-yellow-200",
  success:
    "text-green-950 dark:text-green-300 group-aria-selected:text-white dark:group-aria-selected:text-white dark:group-focus:text-green-200",
  secondary:
    "text-gray-400 dark:text-gray-300 group-aria-selected:text-white dark:group-aria-selected:text-white dark:group-focus:text-gray-200",
};

interface MenuButtonPropsInternal {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  disabled?: boolean;
  colorVariant?: "primary" | "danger" | "warning" | "success" | "secondary";
  descriptionSlot?: React.ReactNode;
}

export type MenuButtonProps = ComponentProps<typeof MenuButton>;

// TODO: consider merging MenuButton and Button - on a design level or on a code level
export const MenuButton = cf.button<MenuButtonPropsInternal>(
  {
    type: "button",
    className: ({
      disabled,
      descriptionSlot,
      className,
      colorVariant = "primary",
    }) =>
      classNames(
        className,
        "group",
        "transition-colors",
        "text-left text-xs w-full first-of-type:rounded-t-lg last-of-type:rounded-b-lg flex flex-row gap-2 py-4 pl-5 pr-4 focus:outline-none",
        "bg-transparent",
        styleConfig[colorVariant][disabled ? "disabled" : "enabled"],
        {
          "items-center": !descriptionSlot,
          "items-start": !!descriptionSlot,
        },
      ),
    children: ({
      leftSlot,
      rightSlot,
      colorVariant = "primary",
      descriptionSlot,
      children,
    }) => {
      const childrenNode = (
        <div className="grow empty:hidden flex items-center">{children}</div>
      );
      return (
        <>
          <div className="shrink-0 w-[1lh] h-[1lh] empty:hidden flex items-center justify-center">
            {leftSlot}
          </div>
          {descriptionSlot ? (
            <div className="grow empty:hidden flex flex-col gap-1">
              <div>{childrenNode}</div>
              <div
                className={classNames(
                  "text-xs",
                  descriptionConfig[colorVariant],
                )}
              >
                {descriptionSlot}
              </div>
            </div>
          ) : (
            childrenNode
          )}
          <div className="shrink-0 w-[1lh] h-[1lh] empty:hidden flex items-center justify-center">
            {rightSlot}
          </div>
        </>
      );
    },
    "data-color-variant": (p) => p.colorVariant,
  },
  ["leftSlot", "rightSlot", "colorVariant", "descriptionSlot"],
);
