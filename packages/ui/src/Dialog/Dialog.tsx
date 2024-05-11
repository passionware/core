import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useMemo,
  useState,
} from 'react';
import {
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import {DialogContextProvider} from "./compound/DialogContext";

export type DialogProps = PropsWithChildren<{
  initialOpen?: boolean;
  open?: boolean;
  onOpenChange?: Dispatch<SetStateAction<boolean>>;
}>;

export function useDialog({
  initialOpen = false,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: DialogProps = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen);
  const [labelId, setLabelId] = useState<string | undefined>();
  const [descriptionId, setDescriptionId] = useState<string | undefined>();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    open,
    onOpenChange: setOpen,
  });

  const click = useClick(data.context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(data.context, { outsidePressEvent: 'mousedown' });
  const role = useRole(data.context);

  const interactions = useInteractions([click, dismiss, role]);

  return useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
    }),
    [open, setOpen, interactions, data, labelId, descriptionId]
  );
}

export function Dialog({ children, ...options }: DialogProps) {
  const dialog = useDialog(options);
  return (
    <DialogContextProvider value={dialog}>{children}</DialogContextProvider>
  );
}
