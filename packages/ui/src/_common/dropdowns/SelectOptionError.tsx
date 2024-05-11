import { cf } from "@passionware/component-factory";
import classNames from "classnames";

export const SelectOptionError = cf.div<{ message?: string }>({
  className: classNames(
    "cursor-default px-lg py-md text-sm text-red-600 min-w-[10rem]",
  ),
  children: (props) => props.message ?? "Error",
});
