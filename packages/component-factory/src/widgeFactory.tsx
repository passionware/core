import { Maybe, maybe } from "@passionware/monads";
import { createContext, FC, useContext } from "react";
import { EnhanceWithHook, injectArg } from "./widgetFactory.types";

export function createWidgetFactory<Config, WidgetOwnProps>(
  componentFactory: (config: Config) => FC<WidgetOwnProps>,
) {
  return function createConnectedWidget<InjectableProps extends object>(
    config: EnhanceWithHook<Config, InjectableProps & WidgetOwnProps>,
  ) {
    return {
      withIsolatedProps: <
        IgnoredProps extends keyof (InjectableProps & WidgetOwnProps),
      >(
        ignoredProps: IgnoredProps[] = [],
      ) => {
        const Context = createContext<Maybe<InjectableProps & WidgetOwnProps>>(
          maybe.ofAbsent(),
        );

        const useProps = () =>
          maybe.getOrThrow(
            useContext(Context),
            "Attempted to use hook outside of the main widget component",
          );

        const Widget: FC<InjectableProps & WidgetOwnProps> = (props) => {
          // Filter out only ignored fields related to the core functionality of the widget
          const passthroughProps = Object.entries(props).reduce(
            (acc, [key, value]) => {
              if (!ignoredProps.includes(key as IgnoredProps)) {
                acc[key as keyof typeof acc] = value;
              }
              return acc;
            },
            {} as WidgetOwnProps & Omit<InjectableProps, IgnoredProps>,
          );

          // Create the component using the factory function and pass it the hooks and props
          const Component = componentFactory(injectArg(config, useProps));

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
