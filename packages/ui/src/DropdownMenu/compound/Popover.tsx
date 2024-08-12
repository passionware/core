import { FloatingFocusManager, FloatingList } from "@floating-ui/react";
import { cloneElement, CSSProperties, ReactElement, Ref } from "react";
import { useDropdownMenuInternalContext } from "../DropdownMenu.context";

export interface PopoverProps {
  children: ReactElement<{
    style?: CSSProperties;
    ref: Ref<HTMLElement>;
    onKeyDown?: (event: KeyboardEvent) => void;
  }>;
}

export function Popover(props: PopoverProps) {
  const internal = useDropdownMenuInternalContext();
  return (
    !internal.disabled &&
    internal.isOpen && (
      <FloatingFocusManager context={internal.floating.context}>
        <FloatingList elementsRef={internal.listRef}>
          {cloneElement(props.children, {
            ref: internal.floating.refs.setFloating,
            style: internal.floating.floatingStyles,
            ...internal.interactions.getFloatingProps({
              onKeyDown(event) {
                if (event.key === "Enter") {
                  internal.onEnter();
                }
              },
            }),
          })}
        </FloatingList>
      </FloatingFocusManager>
    )
  );
}
