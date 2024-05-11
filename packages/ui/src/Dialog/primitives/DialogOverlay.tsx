import { cfe } from "@passionware/component-factory";
import { FloatingOverlay } from "@floating-ui/react";
import { FC, HTMLProps } from "react";

export interface OverlayProps extends HTMLProps<HTMLDivElement> {
  /**
   * Whether the overlay should lock scrolling on the document body.
   * @default false
   */
  lockScroll?: boolean;
}

export const Overlay = cfe(FloatingOverlay as FC<OverlayProps>, {
  className: "z-10 bg-black/60 grid place-items-center backdrop-blur-sm",
});
