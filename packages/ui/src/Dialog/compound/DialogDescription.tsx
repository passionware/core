import { ReactElement, cloneElement, forwardRef, useLayoutEffect } from 'react';
import { useId } from '@floating-ui/react';
import { useDialogContext } from './DialogContext';

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  { children: ReactElement }
>(function ({ children }, ref) {
  const { setDescriptionId } = useDialogContext();
  const id = useId();

  // Only sets `aria-describedby` on the Dialog root element
  // if this component is mounted inside it.
  useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  return cloneElement(children, { id, ref });
});
