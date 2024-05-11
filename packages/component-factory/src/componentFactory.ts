import {
  ComponentProps,
  ComponentType,
  DOMFactory,
  ReactHTML,
  Ref,
  createElement,
  forwardRef,
} from "react";
import mergeProps from "merge-props";
import { MakeOptional } from "@passionware/platform-ts";

type NativeTag = keyof ReactHTML;
type SupportedTag = NativeTag | ComponentType<any>;

type GetHTMLElement<T extends NativeTag> =
  ReactHTML[T] extends DOMFactory<any, infer E> ? E : never;

type PropsOf<T extends SupportedTag> = T extends NativeTag
  ? ReactHTML[T] extends DOMFactory<infer P, any>
    ? P
    : never
  : ComponentProps<T>;

type DataProps = {
  [key: `data-${string}`]: string;
};

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
  TElement extends SupportedTag,
  TProps extends object,
  TSpec extends ResolutionSpec<PropsOf<TElement> & TProps, PropsOf<TElement>>,
>(elementType: TElement, propsSpec: TSpec, excludeProps?: (keyof TProps)[]) {
  return forwardRef<
    TElement,
    MakeOptional<PropsOf<TElement> & TProps, keyof TSpec>
  >(function ComponentFactory(props, ref) {
    const resolvedProps = Object.keys(propsSpec).reduce(
      (acc, key) => {
        const propValue = propsSpec[key as keyof typeof propsSpec];
        const resolvedValue =
          typeof propValue === "function" ? propValue(props) : propValue;

        if (typeof propValue === "function") {
          // If the prop is resolved using a callback function, use the resolved value
          // and mark the prop to be excluded from the original props
          acc.resolved[key as keyof typeof acc.resolved] = resolvedValue;
          acc.excludeFromProps[key as keyof typeof acc.excludeFromProps] = true;
        } else {
          // If the prop is not a function, include it in the resolved props without exclusion
          acc.resolved[key as keyof typeof acc.resolved] = resolvedValue;
        }

        return acc;
      },
      {
        resolved: {} as PropsOf<TElement> & TProps,
        excludeFromProps: {} as { [key: string]: boolean },
      },
    );

    // Exclude props that were resolved using callback functions
    const finalProps = Object.keys(props).reduce(
      (acc, key) => {
        if (
          !resolvedProps.excludeFromProps[key] &&
          (!excludeProps || !excludeProps.includes(key as keyof TProps))
        ) {
          // @ts-expect-error todo finish TS upgrade
          acc[key] = props[key];
        }
        return acc;
      },
      {} as PropsOf<TElement> & TProps,
    );

    // Merge the resolved props with the remaining original props and the ref
    const mergedProps = mergeProps(resolvedProps.resolved, finalProps, {
      ref,
    });

    return createElement(elementType, mergedProps);
  });
}

type BoundFactory<TElement extends NativeTag> = <TProps extends object>(
  propsSpec: ResolvableProps<
    TProps & PropsOf<TElement> & DataProps,
    PropsOf<TElement> & DataProps
  >,
  excludeProps?: (keyof TProps)[],
) => ComponentType<
  TProps &
    PropsOf<TElement> &
    DataProps & { ref?: Ref<GetHTMLElement<TElement>> }
>;

type BoundFactories = {
  [K in NativeTag]: BoundFactory<K>;
};

/**
 * // Usage examples
 * const Example1 = cf.div({
 *   className: 'foo',
 *   children: 'bar'
 * });
 *
 * const Example2 = cf.div<{ customProp: string }>({
 *   className: 'foo',
 *   children: 'bar',
 *   onClick: ({ customProp }) => console.log(customProp) // Change 'dupa' to 'customProp' or another prop name
 * });
 *
 * const Example3 = cfe<'button', { customProp: string }>('button', {
 *   className: 'foo',
 *   children: 'bar',
 *   type: ({ customProp }) => console.log(customProp) // Change 'dupa' to 'customProp' or another prop name
 * });
 */
export const cf = new Proxy({} as BoundFactories, {
  get: (_, elementType: any) => (propsSpec: any, excludedProps: any) =>
    cfe(elementType, propsSpec, excludedProps),
});
