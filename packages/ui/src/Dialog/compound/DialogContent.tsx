import {
  FloatingFocusManager,
  FloatingPortal,
  useMergeRefs,
  useTransitionStyles,
} from "@floating-ui/react";
import classNames from "classnames";
import { forwardRef, HTMLProps } from "react";
import { Overlay } from "../primitives/DialogOverlay";
import { useDialogContext } from "./DialogContext";

export const DialogContent = forwardRef<
  HTMLDivElement,
  HTMLProps<HTMLDivElement>
>(function (props, propRef) {
  const { context: floatingContext, ...context } = useDialogContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  const backdropTransition = useTransitionStyles(floatingContext, {
    duration: { open: 200, close: 400 },
  });

  const floatingTransition = useTransitionStyles(floatingContext, {
    duration: { open: 400, close: 100 },
    initial: {
      opacity: 0,
      transform: "translateY(0.25rem) scale(0.95)",
    },
    close: {
      opacity: 0,
      transform: "translateY(-0.25rem) scale(1.05)",
    },
  });

  return (
    <FloatingPortal>
      {backdropTransition.isMounted && (
        <Overlay lockScroll style={backdropTransition.styles}>
          <FloatingFocusManager context={floatingContext} initialFocus={-1}>
            <div
              ref={ref}
              aria-labelledby={context.labelId}
              aria-describedby={context.descriptionId}
              style={floatingTransition.styles}
              {...context.getFloatingProps({
                ...props,
                className: classNames(
                  props.className,
                  "h-screen flex flex-col items-center justify-center",
                ),
              })}
            >
              {props.children}
            </div>
          </FloatingFocusManager>
        </Overlay>
      )}
    </FloatingPortal>
  );
});
