import { ReactElement, cloneElement, forwardRef } from 'react';
import { useMergeRefs } from '@floating-ui/react';
import { useDialogContext } from './DialogContext';

interface DialogTriggerProps {
  children: ReactElement<{ 'data-state'?: 'open' | 'closed' }>;
}

export const DialogTrigger = forwardRef<HTMLElement, DialogTriggerProps>(
  function ({ children }, propRef) {
    const context = useDialogContext();
    const ref = useMergeRefs([context.refs.setReference, propRef]);

    return cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...children.props,
        // @ts-expect-error getReferenceProps should return props with data-state
        'data-state': context.open ? 'open' : 'closed',
      })
    );
  }
);
