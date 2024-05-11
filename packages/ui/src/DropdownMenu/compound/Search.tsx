import { ChangeEvent, cloneElement, KeyboardEvent, ReactElement } from "react";
import { useDropdownMenuInternalContext } from "../DropdownMenu.context";

export interface SearchProps {
  children: ReactElement<{
    onKeyDown?: (event: KeyboardEvent) => void;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  }>;
}

export function Search(props: SearchProps) {
  const internal = useDropdownMenuInternalContext();
  return cloneElement(props.children, {
    onKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        internal.onEnter();
        event.stopPropagation();
        event.preventDefault();
      }
      props.children.props.onKeyDown?.(event);
    },
    onChange(event: ChangeEvent<HTMLInputElement>) {
      internal.onQueryChange(event.target.value);
    },
  });
}
