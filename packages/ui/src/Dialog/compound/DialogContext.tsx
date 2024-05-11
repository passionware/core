import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { useFloating, useInteractions } from '@floating-ui/react';

export type ContextType =
  | (({
      open: boolean;
      setOpen: Dispatch<SetStateAction<boolean>>;
    } & ReturnType<typeof useInteractions> &
      ReturnType<typeof useFloating>) & {
      labelId: string | undefined;
      descriptionId: string | undefined;
      setLabelId: Dispatch<SetStateAction<string | undefined>>;
      setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
    })
  | null;

const DialogContext = createContext<ContextType>(null);

export const useDialogContext = () => {
  const context = useContext(DialogContext);

  if (context == null) {
    throw new Error('Dialog components must be wrapped in <Dialog />');
  }

  return context;
};

export const DialogContextProvider = DialogContext.Provider;
