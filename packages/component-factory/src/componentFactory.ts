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

type IfNotFunction<MaybeFunction, ElseType> = MaybeFunction extends (
  ...args: any[]
) => any
  ? MaybeFunction
  : ElseType;

type ResolvableProps<PropsIn extends PropsOut, PropsOut extends object> = {
  [K in keyof PropsOut]:
    | PropsOut[K]
    | IfNotFunction<
        PropsOut[K],
        (props: PropsIn) => PropsOut[K] | undefined | void
      >;
};

type ResolutionSpec<
  PropsIn extends PropsOut,
  PropsOut extends object,
> = Partial<ResolvableProps<PropsIn, PropsOut>>;

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
    const resolvedProps = Object.keys(propsSpec).reduce(
      (acc, key) => {
        const propValue = propsSpec[key as keyof typeof propsSpec];
        const resolvedValue =
          typeof propValue === "function" ? propValue(props) : propValue;

        if (typeof propValue === "function") {
          acc.resolved[key as keyof typeof acc.resolved] = resolvedValue;
          acc.excludeFromProps[key as keyof typeof acc.excludeFromProps] = true;
        } else {
          acc.resolved[key as keyof typeof acc.resolved] = resolvedValue;
        }

        return acc;
      },
      {
        resolved: {} as ComponentPropsWithRef<TElement> & TProps,
        excludeFromProps: {} as { [key: string]: boolean },
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

    const mergedProps = mergeProps(resolvedProps.resolved, finalProps);

    return createElement(elementType, mergedProps);
  };
}

type BoundFactory<TElement extends NativeTag> = <TProps extends object>(
  propsSpec: ResolvableProps<
    TProps & ComponentPropsWithRef<TElement>,
    ComponentPropsWithRef<TElement>
  >,
  excludeProps?: (keyof TProps)[],
) => ComponentType<TProps & ComponentPropsWithRef<TElement>>;

type BoundFactories = {
  [K in NativeTag]: BoundFactory<K>;
};

export const cf = new Proxy({} as BoundFactories, {
  get: (_, elementType: any) => (propsSpec: any, excludedProps: any) =>
    cfe(elementType, propsSpec, excludedProps),
});
