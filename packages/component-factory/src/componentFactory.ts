import { MakeOptional } from "@passionware/platform-ts";
import mergeProps from "merge-props";
import {
  ComponentPropsWithRef,
  ComponentType,
  createElement,
  JSX,
} from "react";

type NativeTag = keyof JSX.IntrinsicElements;
type SupportedElementSpec = NativeTag | ComponentType<any>;

type ResolvableProps<Props, BaseProps> = {
  [K in keyof BaseProps]:
    | BaseProps[K]
    | ((props: Props) => BaseProps[K] | undefined | void);
};

type ResolutionSpec<Props, BaseProps> = Partial<
  ResolvableProps<Props, BaseProps>
>;

export function cfe<
  TElement extends SupportedElementSpec,
  TProps extends object,
  TSpec extends ResolutionSpec<
    ComponentPropsWithRef<TElement> & TProps,
    ComponentPropsWithRef<TElement>
  >,
>(elementType: TElement, propsSpec: TSpec, excludeProps?: (keyof TProps)[]) {
  return function ComponentFactory(
    props: MakeOptional<ComponentPropsWithRef<TElement> & TProps, keyof TSpec>,
  ) {
    const resolvedProps = Object.entries(propsSpec).reduce(
      (acc, [key, propValue]) => {
        const resolvedValue =
          typeof propValue === "function" ? propValue(props) : propValue;
        acc.resolved[key as keyof typeof acc.resolved] = resolvedValue;
        if (typeof propValue === "function") acc.excludeFromProps[key] = true;
        return acc;
      },
      {
        resolved: {} as ComponentPropsWithRef<TElement> & TProps,
        excludeFromProps: {} as Record<string, boolean>,
      },
    );

    const finalProps = Object.keys(props).reduce(
      (acc, key) => {
        if (
          !resolvedProps.excludeFromProps[key] &&
          (!excludeProps || !excludeProps.includes(key as keyof TProps))
        ) {
          acc[key as keyof typeof acc] = props[key as keyof typeof props];
        }
        return acc;
      },
      {} as ComponentPropsWithRef<TElement> & TProps,
    );

    return createElement(
      elementType,
      mergeProps(resolvedProps.resolved, finalProps),
    );
  };
}

type BoundFactory<TElement extends NativeTag> = <TProps extends object>(
  propsSpec: ResolvableProps<
    TProps & ComponentPropsWithRef<TElement>,
    ComponentPropsWithRef<TElement>
  >,
  excludeProps?: (keyof TProps)[],
) => ComponentType<TProps & ComponentPropsWithRef<TElement>>;

type BoundFactories = { [K in NativeTag]: BoundFactory<K> };

export const cf = new Proxy({} as BoundFactories, {
  get: (_, elementType: any) => (propsSpec: any, excludedProps: any) =>
    cfe(elementType, propsSpec, excludedProps),
});
