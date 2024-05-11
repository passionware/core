import { ReactElement, cloneElement, forwardRef } from 'react';
import { useDialogContext } from './DialogContext';

export interface DialogCloseProps {
  children: ReactElement;
}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  function ({ children }, ref) {
    const { setOpen } = useDialogContext();

    return cloneElement(children, {
      onClick: () => {
        setOpen(false);
        children.props.onClick?.();
      },
      ref,
    });
  }
);
