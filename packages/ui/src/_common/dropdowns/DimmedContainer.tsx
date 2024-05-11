import { cf } from "@passionware/component-factory";
import classNames from "classnames";

export const DimmedContainer = cf.div<{ shouldDim: boolean }>(
  {
    className: (props) =>
      classNames(
        "transition duration-400 ease-out",
        {
          "blur-[1px] opacity-80 ease-in": props.shouldDim,
        },
        props.className,
      ),
  },
  ["shouldDim"],
);
