import { forwardRef, HTMLProps, useId, useLayoutEffect } from "react";
import { useDialogContext } from "./DialogContext";

export const DialogHeading = forwardRef<
  HTMLDivElement,
  HTMLProps<HTMLDivElement>
>(function ({ children, ...props }, ref) {
  const { setLabelId } = useDialogContext();
  const id = useId();

  // Only sets `aria-labelledby` on the Dialog root element
  // if this component is mounted inside it.
  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return (
    <div {...props} ref={ref} id={id}>
      {children}
    </div> // can't use h2 due to aggresive v1 global styles
  );
});
