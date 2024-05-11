import { cf } from "@passionware/component-factory";
import classNames from "classnames";

export const SelectOptionEmpty = cf.div({
  className: classNames(
    "cursor-default select-none px-lg py-md text-sm text-fg-muted min-w-[10rem]",
  ),
  children: "No results",
});
