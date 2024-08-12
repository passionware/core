import { maybe, Maybe } from "@passionware/monads";
import {
  autoUpdate,
  flip,
  offset,
  Placement,
  shift,
  useClick,
  useDismiss,
  useFloating,
  UseFloatingOptions,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { ReactNode, useRef, useState } from "react";
import { Item } from "./compound/Item";
import { Popover } from "./compound/Popover";
import { Search } from "./compound/Search";
import { SearchList } from "./compound/SearchList";
import { Trigger } from "./compound/Trigger";
import {
  DropdownMenuContext,
  DropdownMenuProvider,
} from "./DropdownMenu.context";

export interface DropdownMenuProps {
  children: ReactNode;
  // value: string; // not sure, this could be like preselected option
  onSelect?: (value: string) => void;
  placement?: Placement;
  floatingOptions?: Partial<Omit<UseFloatingOptions, "open">>;
  disabled?: boolean;
}

function DropdownMenuParent({
  children,
  onSelect,
  disabled = false,
  placement = "bottom-start",
  floatingOptions: { onOpenChange, ...floatingOptions } = {},
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false); // todo useControlledState
  const [query, setQuery] = useState("");
  //
  const [activeIndex, setActiveIndex] = useState<Maybe<number>>(
    maybe.ofAbsent(),
  );
  const [defaultSelectedIndex, setDefaultSelectedIndex] = useState<
    Maybe<number>
  >(maybe.ofAbsent());
  const firstFocusRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLElement[]>([]);

  const itemProps = useRef<DropdownMenuContext["itemProps"]>({});

  const floating = useFloating({
    open: isOpen,
    onOpenChange: (open, event, reason) => {
      setIsOpen(open);
      onOpenChange?.(open, event, reason);
    },
    placement,
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
    ...floatingOptions,
  });

  const interactions = useInteractions([
    useClick(floating.context),
    useRole(floating.context, { role: "listbox" }),
    useDismiss(floating.context),
    useListNavigation(floating.context, {
      listRef,
      activeIndex: maybe.getOrElse(activeIndex, null),
      selectedIndex: maybe.getOrElse(defaultSelectedIndex, null),
      loop: true,
      focusItemOnOpen: true,
      onNavigate: setActiveIndex,
      virtual: true,
      // cols: 2 // todo for categories
    }),
  ]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value) {
      setActiveIndex(0);
    }
  }
  const handleItemSelect = (id: string) => {
    const props = itemProps.current[id];
    if (props?.closeOnSelect !== false) {
      setQuery("");
      setIsOpen(false);
    }
    props?.onClick?.();
    // todo decide if we want to call onSelect here or in the onClick
    // todo decide if we want to close always
    onSelect?.(id);
  };

  function handleEnter() {
    if (maybe.isAbsent(activeIndex)) {
      console.error("No active index found", activeIndex);
      return;
    }
    const { id } = listRef.current[activeIndex].dataset;
    if (maybe.isAbsent(id)) {
      console.error("No id found", id);
      return;
    }
    handleItemSelect(id);
  }

  return (
    <DropdownMenuProvider
      // todo if we want to memoize everything, let's put everything in useMemo'ed zustand and use selectors
      value={{
        floating,
        interactions,
        activeIndex,
        onDefaultSelectedResolve: setDefaultSelectedIndex,
        itemProps: itemProps.current,
        onSelect: handleItemSelect,
        onQueryChange: handleQueryChange,
        isOpen,
        firstFocusRef,
        listRef,
        onEnter: handleEnter,
        onCancel: () => setIsOpen(false),
        query,
        disabled,
      }}
    >
      {children}
    </DropdownMenuProvider>
  );
}

export const DropdownMenu = Object.assign(DropdownMenuParent, {
  Trigger,
  Popover,
  Search,
  SearchList,
  Item,
});
