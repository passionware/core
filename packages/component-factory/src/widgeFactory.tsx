import { injectArg, EnhanceWithHook } from "./widgetFactory.types";
import { Maybe, maybe, rd, RemoteData } from "@passionware/monads";
import { createContext, FC, useContext } from "react";

/**
 * Our most liked standard to create widgets (complex components).
 * It might seem a bit overengineered, but it there is a lot of value in it.
 * This is the standardised way to provide data to components, other than just props.
 * If we need to provide data to nested components, in props-passing way, we have to prepare all data upfront, and propagate it down the tree.
 * However, it has some drawbacks like prop-drilling, and it's not always possible to prepare all data upfront.
 *
 * There is a better way to inject data into components, via custom hooks.
 * This patterns allow you to decide how you want to provide data to the component (and inner components!) in a more flexible way.
 * You may want to source data from Tanstack Query, Zustand, memoized redux selectors, or any other source.
 * All of them can be easily injected into specific subcomponents.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function createWidgetFactory<Config>(
  componentFactory: <OuterProps>(config: Config) => FC<OuterProps>,
) {
  return function createConnectedWidget<Props extends object>(
    config: EnhanceWithHook<Config, Props>,
  ) {
    return {
      withIsolatedProps: <IgnoredProps extends keyof Props>(
        ignoredProps: IgnoredProps[],
      ) => {
        const Context = createContext<Maybe<Props>>(maybe.ofAbsent());

        const useProps = () =>
          maybe.getOrThrow(
            useContext(Context),
            "Attempted to use hook outside of the main widget component",
          );

        const Widget: FC<Props> = (props) => {
          // Filter out ignored fields from props
          const passthroughProps = Object.entries(props).reduce(
            (acc, [key, value]) => {
              if (!ignoredProps.includes(key as IgnoredProps)) {
                acc[key as keyof typeof acc] = value;
              }
              return acc;
            },
            {} as Omit<Props, IgnoredProps>,
          );

          // Create the component using the factory function and pass it the hooks and props
          const Component = componentFactory<Omit<Props, IgnoredProps>>(
            injectArg(config, useProps),
          );

          return (
            <Context.Provider value={maybe.of(props)}>
              <Component {...passthroughProps} />
            </Context.Provider>
          );
        };

        return Widget;
      },
    };
  };
}
