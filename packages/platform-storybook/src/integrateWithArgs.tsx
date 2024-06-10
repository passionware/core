import { createSimpleEvent, useSimpleEventSubscription } from '@passionware/simple-event';
import { createContext, Dispatch, FC, SetStateAction, useContext, useState } from 'react';

type ComponentSpec<T> =
  | FC<T>
  | {
      Component: FC<T>;
      useRender?: () => void;
    };

/**
 * This function is used to integrate a component with args via context.
 * @param factory A function that takes a `useArgs` function and returns a component.
 * This is primarily used with component factories
 * @param getInitialSharedState A function that takes the args and returns the initial shared state
 */
export function integrateWithArgs<Props, OuterProps = {}, State = undefined>(
  factory: (
    useArgs: () => Props,
    useSharedState: () => [State, Dispatch<SetStateAction<State>>]
  ) => ComponentSpec<OuterProps>,
  getInitialSharedState?: (args: Props) => State
): FC<Props & OuterProps> {
  const ctx = createContext<Props | undefined>(undefined);
  const stateContext = createContext<[State, Dispatch<SetStateAction<State>>] | undefined>(
    undefined
  );
  const useArgs = () => {
    const value = useContext(ctx);
    if (value === undefined) {
      throw new Error('Args not available');
    }
    return value;
  };
  const useSharedState = () => {
    const value = useContext(stateContext);
    if (value === undefined) {
      throw new Error('State not available');
    }

    return value;
  };
  const factoryResult = factory(useArgs, useSharedState);

  const componentSpec = 'Component' in factoryResult ? factoryResult : { Component: factoryResult };

  const ComponentInner = componentSpec.Component;
  function RenderHookWrapper() {
    componentSpec.useRender?.();
    return null;
  }
  return function ComponentOuter(props) {
    const useStateResult = useState(
      (() => getInitialSharedState?.(props) ?? undefined) as State // todo create function overload or decompose the utility
    );
    return (
      <ctx.Provider value={props}>
        <stateContext.Provider value={useStateResult}>
          <RenderHookWrapper />
          <ComponentInner {...(props as any)} />
        </stateContext.Provider>
      </ctx.Provider>
    );
  };
}

/**
 * A variant of `integrateWithArgs` that also provides an action emitter.
 * This is useful for components factories that accept actions in their config, that intentionally are bypassed in the react environment.
 * For testing/storybook purposes, we can use this function to provide a way to emit actions that are defined in React (storybook) environment.
 * @param factory
 */
export function integrateWithArgsAndActions<
  Args extends { onAction: (action: string) => void },
  OuterProps = {},
>(
  factory: (
    useArgs: () => Args,
    handleAction: (name: string, ...values: unknown[]) => void
  ) => ComponentSpec<OuterProps>
): FC<Args & OuterProps> {
  const ctx = createContext<Args | undefined>(undefined);
  const useArgs = () => {
    const value = useContext(ctx);
    if (value === undefined) {
      throw new Error('Args not available');
    }
    return value;
  };
  const actionEvent = createSimpleEvent<string>();
  const factoryResult = factory(useArgs, actionEvent.emit);

  const componentSpec = 'Component' in factoryResult ? factoryResult : { Component: factoryResult };

  const ComponentInner = componentSpec.Component;
  function RenderHookWrapper() {
    componentSpec.useRender?.();
    const args = useArgs();
    useSimpleEventSubscription(actionEvent.addListener, args.onAction);
    return null;
  }
  return function ComponentOuter(props) {
    return (
      <ctx.Provider value={props}>
        <RenderHookWrapper />
        <ComponentInner {...(props as any)} />
      </ctx.Provider>
    );
  };
}
