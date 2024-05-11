import { ButtonProps } from '@passionware/ui/button';
import { ButtonHTMLAttributes, FocusEvent, MouseEvent, forwardRef } from 'react';
import { useFloatingTree, useListItem, useMergeRefs } from '@floating-ui/react';
import { MenuButton, MenuButtonProps } from '@passionware/ui/button';
import { useMenuContext } from "./Menu.context";

interface MenuItemProps
  extends Pick<
      ButtonProps,
      'colorVariant' | 'sizeVariant' | 'styleVariant' | 'leftSlot' | 'rightSlot'
    >,
    Pick<MenuButtonProps, 'descriptionSlot'> {
  label: string;
  disabled?: boolean;
}

/**
 * @experimental API might change.
 */
export const MenuItem = forwardRef<
  HTMLButtonElement,
  MenuItemProps & ButtonHTMLAttributes<HTMLButtonElement>
>(({ label, disabled, ...props }, forwardedRef) => {
  const menuContext = useMenuContext();
  const item = useListItem({ label: disabled ? null : label });
  const tree = useFloatingTree();
  const isActive = item.index === menuContext.activeIndex;

  return (
    <MenuButton
      ref={useMergeRefs([item.ref, forwardedRef])}
      type="button"
      role="menuitem"
      className="MenuItem"
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      {...menuContext.getItemProps({
        ...props,
        onClick(event: MouseEvent<HTMLButtonElement>) {
          tree?.events.emit('click');
          setTimeout(() => {
            // https://github.com/floating-ui/floating-ui/issues/2017 - looks like it doesn't fix when inside floating tree
            props.onClick?.(event);
          }, 0);
          event.stopPropagation();
        },
        onFocus(event: FocusEvent<HTMLButtonElement>) {
          props.onFocus?.(event);
          menuContext.setHasFocusInside(true);
        },
      })}
    >
      {label}
    </MenuButton>
  );
});
