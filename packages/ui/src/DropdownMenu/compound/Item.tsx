import { useId, useListItem } from "@floating-ui/react";
import {
  cloneElement,
  ReactElement,
  Ref,
  useEffect,
  useLayoutEffect,
} from "react";
import { useDropdownMenuInternalContext } from "../DropdownMenu.context";

export interface MenuItemProps {
  id?: string;
  onClick?: () => void;
  label?: string;
  children: ReactElement<{
    onClick?: () => void;
    isActive?: boolean;
    ref: Ref<HTMLElement>;
  }>;
  // if such option is mounted, it will be selected
  // this is better than having defaultOption on the root component, because this can also work with options that render later in time
  setActiveOnRender?: boolean; // todo setActiveOnMount
  closeOnSelect?: boolean;
}
export function Item(props: MenuItemProps) {
  const internal = useDropdownMenuInternalContext();

  const generatedId = useId();
  const actualId = props.id || generatedId;

  internal.itemProps[actualId] = {
    onClick: props.onClick,
    closeOnSelect: props.closeOnSelect,
  };

  const listItem = useListItem({ label: props.label });

  useEffect(() => {
    return () => {
      delete internal.itemProps[actualId];
    };
  }, []);

  useLayoutEffect(() => {
    if (props.setActiveOnRender) {
      internal.onDefaultSelectedResolve(listItem.index);
    }
  }, [listItem.index !== -1]);

  let isActive = internal.activeIndex === listItem.index;
  return cloneElement(props.children, {
    isActive,
    ...internal.interactions.getItemProps({
      id: actualId,
      // @ts-ignore
      "data-id": actualId,
      "data-active": isActive,
      ref: listItem.ref,
      onClick() {
        internal.onSelect(actualId);
        props.children.props.onClick?.();
      },
      active: isActive,
    }),
  });
}
