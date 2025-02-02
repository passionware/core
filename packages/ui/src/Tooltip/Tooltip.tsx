import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useDelayGroup,
  useDelayGroupContext,
  useDismiss,
  useFloating,
  UseFloatingOptions,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import { cf } from "@passionware/component-factory";
import { cloneElement, ReactElement, Ref, useState } from "react";

export interface TooltipProps {
  children: ReactElement<{
    ref: Ref<HTMLElement>;
  }>;
  popoverSlot: ReactElement;
  role?: "tooltip" | "label";
  delay?: number;
  placement?: UseFloatingOptions["placement"];
  isDisabled?: boolean;
}

export function Tooltip({
  children,
  popoverSlot,
  role = "tooltip",
  delay = 250,
  placement,
  isDisabled = false,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const floating = useFloating({
    open: isOpen,
    placement,
    onOpenChange: setIsOpen,
    middleware: [offset(10), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const delayGroupContext = useDelayGroupContext();
  useDelayGroup(floating.context, { id: floating.context.floatingId });

  const hover = useHover(floating.context, {
    move: false,
    delay: delayGroupContext?.delay || delay,
  });
  const focus = useFocus(floating.context);
  const dismiss = useDismiss(floating.context);
  const role$ = useRole(floating.context, {
    // If your reference element has its own label (text) - tooltip, otherwise (just icon) - label.
    role,
  });

  const interactions = useInteractions([hover, focus, dismiss, role$]);

  const transitionStyles = useTransitionStyles(floating.context, {
    duration: delayGroupContext.isInstantPhase
      ? {
          open: delay,
          // `id` is this component's `id`
          // `currentId` is the current group's `id`
          close:
            delayGroupContext.currentId === floating.context.floatingId
              ? delay
              : 0,
        }
      : delay,
    initial: {
      opacity: 0,
    },
  });

  return (
    <>
      {cloneElement(children, {
        ref: floating.refs.setReference,
        ...interactions.getReferenceProps(),
      })}
      {!isDisabled && transitionStyles.isMounted && (
        <FloatingPortal>
          {cloneElement(popoverSlot as any, {
            ref: floating.refs.setFloating,
            style: { ...floating.floatingStyles, ...transitionStyles.styles },
          })}
        </FloatingPortal>
      )}
    </>
  );
}

export const TooltipPrimitive = cf.div({
  className:
    "px-2 py-1 bg-gray-900 rounded-md flex-col justify-start items-start gap-md inline-flex text-white text-xs font-normal font-sans",
});
