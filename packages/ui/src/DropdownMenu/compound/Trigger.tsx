import { cloneElement, ReactElement, Ref } from "react";
import { useDropdownMenuInternalContext } from "../DropdownMenu.context";

export interface TriggerProps {
  children: ReactElement<{ ref: Ref<HTMLElement> }>;
}
export function Trigger(props: TriggerProps) {
  const internal = useDropdownMenuInternalContext();

  return cloneElement(
    props.children,
    internal.interactions.getReferenceProps({
      ref: internal.floating.refs.setReference,
    }),
  );
}
