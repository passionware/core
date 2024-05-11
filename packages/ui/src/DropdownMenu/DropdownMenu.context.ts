import { maybe, Maybe } from "@passionware/monads";
import { UseFloatingReturn, useInteractions } from "@floating-ui/react";
import {
  createContext,
  MutableRefObject,
  ReactNode,
  Ref,
  useContext,
} from "react";

export interface DropdownMenuContext {
  itemProps: Record<string, { onClick?: () => void; closeOnSelect?: boolean }>;
  onSelect: (id: string) => void;
  onCancel: () => void;
  onDefaultSelectedResolve: (index: number) => void;
  activeIndex: Maybe<number>;
  floating: UseFloatingReturn;
  interactions: ReturnType<typeof useInteractions>;
  isOpen: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onEnter: () => void;
  firstFocusRef: Ref<HTMLElement>;
  listRef: MutableRefObject<HTMLElement[]>;
}

const DropdownMenuContext = createContext<Maybe<DropdownMenuContext>>(
  maybe.ofAbsent(),
);

export const useDropdownMenuInternalContext = () =>
  maybe.getOrThrow(
    useContext(DropdownMenuContext),
    "useDropdownMenuInternalContext must be used within a DropdownMenu",
  );

export const DropdownMenuProvider = DropdownMenuContext.Provider;
export const DropdownMenuConsumer = (props: {
  children: (context: DropdownMenuContext) => ReactNode;
}) => {
  const context = useDropdownMenuInternalContext();
  return props.children(context);
};
