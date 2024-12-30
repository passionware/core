import { SkipWrapNode, wrap } from "@passionware/platform-react";
import { Overwrite } from "@passionware/platform-ts";
import classNames from "classnames";
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import styles from "./Button.module.scss";

export type ButtonProps = Overwrite<
  ComponentPropsWithoutRef<"button">,
  {
    colorVariant?: "primary" | "secondary" | "danger" | "success" | "warning";
    styleVariant?: "solid" | "flat" | "outline" | "ghost";
    sizeVariant?: "md" | "sm";
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
    children?: SkipWrapNode;
  }
>;

const config = {
  primary: {
    solid: classNames(
      "shadow bg-brand-500 hover:bg-brand-600 active:bg-brand-700 aria-expanded:bg-brand-700 text-white border-brand-500 focus-visible:ring-brand-500",
      "dark:bg-brand-600 dark:border-brand-700 dark:hover:bg-brand-700 dark:active:bg-brand-800 dark:aria-expanded:bg-brand-800 dark:focus-visible:ring-brand-800",
    ),
    flat: classNames(
      "bg-white text-brand-500 border-brand-500 hover:bg-brand-100 active:bg-brand-200 aria-expanded:bg-brand-200 focus-visible:ring-brand-500",
      "dark:bg-gray-900 dark:text-brand-300 dark:border-brand-700 dark:hover:bg-gray-800 dark:active:bg-gray-900 dark:aria-expanded:bg-gray-900 dark:focus-visible:ring-brand-700",
    ),
    ghost: classNames(
      "bg-transparent text-brand-500 border-brand-500 hover:bg-brand-100 active:bg-brand-200 aria-expanded:bg-brand-200 focus-visible:ring-brand-500",
      "backdrop-blur-sm dark:text-brand-300 dark:border-brand-700 dark:hover:bg-gray-800/70 dark:active:bg-gray-900 dark:aria-expanded:bg-gray-900 dark:focus-visible:ring-brand-700",
    ),
    outline: classNames(
      "border border-brand-500 text-brand-500 hover:bg-brand-100 active:bg-brand-200 aria-expanded:bg-brand-200 focus-visible:ring-brand-500",
      "dark:border-brand-700 dark:text-brand-600 dark:hover:bg-brand-700/20 dark:active:bg-brand-950/20 dark:aria-expanded:bg-brand-950/20 dark:focus-visible:ring-brand-700",
    ),
  },
  secondary: {
    solid: classNames(
      "shadow bg-white border border-gray-200 hover:bg-gray-200 active:bg-gray-50 aria-expanded:bg-gray-50 text-black border-gray-300 focus-visible:ring-gray-300",
      "dark:bg-gray-600 dark:border-gray-600 dark:hover:bg-gray-700 dark:active:bg-gray-800 dark:aria-expanded:bg-gray-800 dark:text-white dark:focus-visible:ring-gray-700",
    ),
    flat: classNames(
      "bg-white text-gray-500 border-gray-300 hover:bg-gray-200 active:bg-gray-300 aria-expanded:bg-gray-300 focus-visible:ring-gray-300",
      "dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:aria-expanded:bg-gray-700 dark:focus-visible:ring-gray-600",
    ),
    ghost: classNames(
      "text-gray-500 border-gray-300 hover:bg-black/5 active:bg-black/20 aria-expanded:bg-black/20 focus-visible:ring-gray-300",
      "backdrop-blur-sm dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700/70 dark:active:bg-gray-600 dark:aria-expanded:bg-gray-700 dark:focus-visible:ring-gray-600",
    ),
    outline: classNames(
      "border border-gray-300 text-gray-500 hover:bg-gray-200 active:bg-gray-300 aria-expanded:bg-gray-300 focus-visible:ring-gray-300",
      "dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700/20 dark:active:bg-gray-950/20 dark:aria-expanded:bg-gray-950/20 dark:focus-visible:ring-gray-600",
    ),
  },
  danger: {
    solid: classNames(
      "shadow bg-red-500 hover:bg-red-600 active:bg-red-700 aria-expanded:bg-red-700 text-white border-red-500 focus-visible:ring-red-500",
      "dark:bg-red-700 dark:border-red-700 dark:hover:bg-red-800 dark:active:bg-red-900 dark:aria-expanded:bg-red-900 dark:focus-visible:ring-red-800",
    ),
    flat: classNames(
      "bg-white text-red-500 border-red-500 hover:bg-red-100 active:bg-red-200 aria-expanded:bg-red-200 focus-visible:ring-red-500",
      "dark:bg-gray-900 dark:text-red-400 dark:border-red-700 dark:hover:bg-gray-800 dark:active:bg-gray-900 dark:aria-expanded:bg-gray-900 dark:focus-visible:ring-red-700",
    ),
    ghost: classNames(
      "text-red-500 border-red-500 hover:bg-red-100 active:bg-red-200 aria-expanded:bg-red-200 focus-visible:ring-red-500",
      "backdrop-blur-sm dark:text-red-400 dark:border-red-700 dark:hover:bg-gray-800/70 dark:active:bg-gray-900 dark:aria-expanded:bg-gray-900 dark:focus-visible:ring-red-700",
    ),
    outline: classNames(
      "border border-red-500 text-red-500 hover:bg-red-100 active:bg-red-200 aria-expanded:bg-red-200 focus-visible:ring-red-500",
      "dark:border-red-700 dark:text-red-400 dark:hover:bg-red-700/20 dark:active:bg-red-950/20 dark:aria-expanded:bg-red-950/20 dark:focus-visible:ring-red-700",
    ),
  },
  success: {
    solid: classNames(
      "shadow bg-green-500 hover:bg-green-600 active:bg-green-700 aria-expanded:bg-green-700 text-white border-green-500 focus-visible:ring-green-500",
      "dark:bg-green-700 dark:border-green-700 dark:hover:bg-green-800 dark:active:bg-green-900 dark:aria-expanded:bg-green-900 dark:focus-visible:ring-green-800",
    ),
    flat: classNames(
      "bg-white text-green-500 border-green-500 hover:bg-green-100 active:bg-green-200 aria-expanded:bg-green-200 focus-visible:ring-green-500",
      "dark:bg-gray-900 dark:text-green-400 dark:border-green-700 dark:hover:bg-gray-800 dark:active:bg-gray-900 dark:aria-expanded:bg-gray-900 dark:focus-visible:ring-green-700",
    ),
    ghost: classNames(
      "text-green-500 border-green-500 hover:bg-green-100 active:bg-green-200 aria-expanded:bg-green-200 focus-visible:ring-green-500",
      "backdrop-blur-sm dark:text-green-400 dark:border-green-700 dark:hover:bg-gray-800/70 dark:active:bg-gray-900 dark:aria-expanded:bg-gray-900 dark:focus-visible:ring-green-700",
    ),
    outline: classNames(
      "border border-green-500 text-green-500 hover:bg-green-100 active:bg-green-200 aria-expanded:bg-green-200 focus-visible:ring-green-500",
      "dark:border-green-700 dark:text-green-400 dark:hover:bg-green-700/20 dark:active:bg-green-950/20 dark:aria-expanded:bg-green-950/20 dark:focus-visible:ring-green-700",
    ),
  },
  warning: {
    solid: classNames(
      "shadow bg-amber-300 hover:bg-amber-400 active:bg-amber-500 aria-expanded:bg-amber-500 text-black border-amber-300 focus-visible:ring-amber-400",
      "dark:bg-amber-600 dark:border-amber-600 dark:hover:bg-amber-700 dark:active:bg-amber-800 dark:aria-expanded:bg-amber-800 dark:text-white dark:focus-visible:ring-amber-700",
    ),
    flat: classNames(
      "bg-white text-amber-500 border-amber-400 hover:bg-amber-100 active:bg-amber-200 aria-expanded:bg-amber-200 focus-visible:ring-amber-400",
      "dark:bg-gray-900 dark:text-amber-300 dark:border-amber-600 dark:hover:bg-gray-800 dark:active:bg-gray-900 dark:aria-expanded:bg-gray-900 dark:focus-visible:ring-amber-600",
    ),
    ghost: classNames(
      "text-amber-500 border-amber-400 hover:bg-amber-100 active:bg-amber-200 aria-expanded:bg-amber-200 focus-visible:ring-amber-400",
      "backdrop-blur-sm dark:text-amber-300 dark:border-amber-600 dark:hover:bg-gray-800/70 dark:active:bg-gray-900 dark:aria-expanded:bg-gray-900 dark:focus-visible:ring-amber-600",
    ),
    outline: classNames(
      "border border-amber-500 text-amber-500 hover:bg-amber-100 active:bg-amber-200 aria-expanded:bg-amber-200 focus-visible:ring-amber-500",
      "dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-700/20 dark:active:bg-amber-950/20 dark:aria-expanded:bg-amber-950/20 dark:focus-visible:ring-amber-700",
    ),
  },
};

const baseStyles = classNames(
  "font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 flex flex-row items-center",
  "transition-background-color duration-200 ease-out",
  "disabled:opacity-50",
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      colorVariant = "primary",
      styleVariant = "solid",
      sizeVariant = "md",
      leftSlot,
      rightSlot,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const buttonClass = classNames(
      baseStyles,
      config[colorVariant][styleVariant],
      styles.buttonBase,
      styles[`buttonBase_${sizeVariant}`],
      className,
      "select-none",
    );

    return (
      <button type="button" className={buttonClass} ref={ref} {...rest}>
        {leftSlot && (
          <span className="shrink-0 flex items-center justify-center">
            {leftSlot}
          </span>
        )}
        {wrap(children, <span className="grow flex items-center" />)}
        {rightSlot && (
          <span className="shrink-0 flex items-center justify-center">
            {rightSlot}
          </span>
        )}
      </button>
    );
  },
);
