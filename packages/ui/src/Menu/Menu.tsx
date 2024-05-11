/* eslint-disable react-hooks/rules-of-hooks */
import { Button, type ButtonProps, MenuButton } from "@passionware/ui/button";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from "@floating-ui/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline/index";
import {
  FocusEvent,
  forwardRef,
  HTMLProps,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { FloatingContainer } from "../_common/FloatingContainer";
import { MenuContextProvider, useMenuContext } from "./Menu.context";

export interface MenuProps
  extends Pick<
    ButtonProps,
    "colorVariant" | "sizeVariant" | "styleVariant" | "leftSlot" | "rightSlot"
  > {
  textSlot: ReactNode;
  nested?: boolean;
  children?: ReactNode;
  descriptionSlot?: ReactNode; // todo break Menu to 2 components, one for root level (Button), one for nested (MenuButton)
}

/**
 * @deprecated we are working on a DropdownMenu component that will replace this one
 */
export const MenuComponent = forwardRef<
  HTMLButtonElement,
  MenuProps & HTMLProps<HTMLButtonElement>
>(({ children, textSlot, ...props }, forwardedRef) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasFocusInside, setHasFocusInside] = useState(false); // TODO check if :focus-visible is enough
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const elementsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>([]);
  const menuContext = useMenuContext();

  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const item = useListItem();

  const isNested = parentId != null;

  const { floatingStyles, refs, context } = useFloating<HTMLButtonElement>({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: isNested ? "right-start" : "bottom-start",
    middleware: [
      offset({
        mainAxis: isNested ? 0 : 4,
        alignmentAxis: isNested ? -4 : 0,
      }),
      flip(),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: isNested,
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const click = useClick(context, {
    event: "mousedown",
    toggle: !isNested,
    ignoreMouse: isNested,
  });
  const role = useRole(context, { role: "menu" });
  const dismiss = useDismiss(context, { bubbles: true });
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    nested: isNested,
    onNavigate: setActiveIndex,
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    onMatch: isOpen ? setActiveIndex : undefined,
    activeIndex,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [hover, click, role, dismiss, listNavigation, typeahead],
  );

  useEffect(() => {
    // Preselect the first item when the menu is opened
    if (context.open) {
      setActiveIndex(0);
    }
  }, [context.open]);

  // Event emitter allows you to communicate across tree components.
  // This effect closes all menus when an item gets clicked anywhere
  // in the tree.
  useEffect(() => {
    if (!tree) return;

    function handleTreeClick() {
      setIsOpen(false);
    }

    function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
      if (event.nodeId !== nodeId && event.parentId === parentId) {
        setIsOpen(false);
      }
    }

    tree.events.on("click", handleTreeClick);
    tree.events.on("menuopen", onSubMenuOpen);

    return () => {
      tree.events.off("click", handleTreeClick);
      tree.events.off("menuopen", onSubMenuOpen);
    };
  }, [tree, nodeId, parentId]);

  useEffect(() => {
    if (isOpen && tree) {
      tree.events.emit("menuopen", { parentId, nodeId });
    }
  }, [tree, isOpen, nodeId, parentId]);

  const menuButton = isNested ? (
    <MenuButton
      ref={useMergeRefs([refs.setReference, item.ref, forwardedRef])}
      tabIndex={menuContext.activeIndex === item.index ? 0 : -1}
      role="menuitem"
      data-open={isOpen ? "" : undefined}
      data-nested
      data-focus-inside={hasFocusInside ? "" : undefined}
      className="min-w-[7rem]"
      rightSlot={<ChevronRightIcon />}
      {...getReferenceProps(
        menuContext.getItemProps({
          ...props,
          onFocus(event: FocusEvent<HTMLButtonElement>) {
            props.onFocus?.(event);
            setHasFocusInside(false);
            menuContext.setHasFocusInside(true);
          },
        }),
      )}
    >
      {textSlot}
    </MenuButton>
  ) : (
    <Button
      ref={useMergeRefs([refs.setReference, item.ref, forwardedRef])}
      data-open={isOpen ? "" : undefined}
      data-focus-inside={hasFocusInside ? "" : undefined}
      {...getReferenceProps(
        menuContext.getItemProps({
          ...props,
          onFocus(event: FocusEvent<HTMLButtonElement>) {
            props.onFocus?.(event);
            setHasFocusInside(false);
            menuContext.setHasFocusInside(true);
          },
        }),
      )}
    >
      {textSlot}
    </Button>
  );

  return (
    <FloatingNode id={nodeId}>
      {menuButton}
      <MenuContextProvider
        value={{
          activeIndex,
          setActiveIndex,
          getItemProps,
          setHasFocusInside,
          isOpen,
        }}
      >
        <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
          {isOpen && (
            <FloatingPortal>
              <FloatingFocusManager
                context={context}
                modal={false}
                initialFocus={isNested ? -1 : 0}
                returnFocus={!isNested}
              >
                <FloatingContainer
                  ref={refs.setFloating}
                  style={floatingStyles}
                  {...getFloatingProps()}
                >
                  {children}
                </FloatingContainer>
              </FloatingFocusManager>
            </FloatingPortal>
          )}
        </FloatingList>
      </MenuContextProvider>
    </FloatingNode>
  );
});

export const Menu = forwardRef<
  HTMLButtonElement,
  MenuProps & HTMLProps<HTMLButtonElement>
>((props, ref) => {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <MenuComponent {...props} ref={ref} />
      </FloatingTree>
    );
  }

  return <MenuComponent {...props} ref={ref} />;
});
