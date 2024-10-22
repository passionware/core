import { omit, pick } from 'lodash';
import { ComponentType, useCallback, useMemo, useRef } from 'react';

type OmitConfig<T> = Omit<T, 'config'>;

type PropsTransformer<TExtraProps, TInnerProps> = (
  props: OmitConfig<TExtraProps & TInnerProps>
) => OmitConfig<TInnerProps>;

type InjectLogic<TExtraProps, TInnerProps extends { config: any }> = (api: {
  useProps: () => OmitConfig<TExtraProps & TInnerProps>;
  /**
   * @deprecated looks like this is not reactive to props changes
   */
  createHook: <P extends unknown[], R>(
    propsToHookMapper: (
      props: OmitConfig<TExtraProps & TInnerProps>
    ) => (...args: P) => R
  ) => (...args: P) => R;
  createGetter: <T>(
    propsToValueMapper: (props: OmitConfig<TExtraProps & TInnerProps>) => T
  ) => () => T;
}) => TInnerProps['config'];

function getComponent<TInnerProps extends { config: any }, TExtraProps>(t: {
  resolveTransformer: ResolveTransformer<TExtraProps, TInnerProps>;
  injectLogic: InjectLogic<TExtraProps, TInnerProps>;
  WrappedComponent: ComponentType<TInnerProps>;
}) {
  return function InjectedComponent(
    props: OmitConfig<TExtraProps & TInnerProps>
  ) {
    // Use useRef to store the latest props
    const propsRef = useRef(props);

    // Update propsRef with the latest props on each render
    propsRef.current = props;

    // Provide a stable reference to the current props via useProps
    const useProps = useCallback(() => propsRef.current, []);

    // Inject the logic (useOptions) using useProps to access the latest props
    const config = useMemo(
      () =>
        t.injectLogic({
          useProps,
          createHook: createPropsToHook(useProps),
          createGetter: createPropsToValue(useProps)
        }),
      [useProps]
    );

    const propsTransformer = t.resolveTransformer(transform);
    const innerProps = propsTransformer(props) as TInnerProps;

    return <t.WrappedComponent {...innerProps} config={config} />;
  };
}

type ResolveTransformer<TExtraProps, TInnerProps extends { config: any }> = (
  transformFn: typeof transform
) => PropsTransformer<TExtraProps, TInnerProps>;

/**
 * Injects a config object into a component
 */
export function injectConfig<TInnerProps extends { config: any }>(
  WrappedComponent: ComponentType<TInnerProps>
) {
  return {
    // static, fromExistingProps, fromExtraProps -> to powinno w chainie fajnie dawać metody do wyboru transformacji propsów
    static: (injected: ReturnType<InjectLogic<{}, TInnerProps>>) => {
      return getComponent<TInnerProps, {}>({
        injectLogic: () => injected,
        resolveTransformer: () => transform.passAll,
        WrappedComponent
      });
    },
    fromProps: <TExtraProps,>(
      injectLogic: InjectLogic<TExtraProps, TInnerProps>
    ) => {
      return {
        transformProps: (
          resolveTransformer: ResolveTransformer<TExtraProps, TInnerProps>
        ) =>
          getComponent({
            injectLogic,
            resolveTransformer,
            WrappedComponent
          })
      };
    }
  };
}

const transform = {
  skipAll: () => ({}),
  passAll: <T,>(props: T) => props,
  skipFields:
    <T extends object, K extends keyof T>(...keys: K[]) =>
    (props: T) => {
      return omit(props, keys);
    },
  passFields:
    <T extends object, K extends keyof T>(...keys: K[]) =>
    (props: T) => {
      return pick(props, keys);
    }
};

function createPropsToHook<TProps>(useProps: () => TProps) {
  return function useHook<T>(propsToHookMapper: (props: TProps) => T) {
    return propsToHookMapper(useProps());
  };
}

function createPropsToValue<TProps>(useProps: () => TProps) {
  return function useHook<T>(propsToHookMapper: (props: TProps) => T) {
    const props = useProps();
    return () => propsToHookMapper(props);
  };
}
