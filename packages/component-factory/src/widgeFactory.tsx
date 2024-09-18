import { Maybe, maybe } from "@passionware/monads";
import { ComponentType, createContext, FC, useContext, Context } from "react";
import { EnhanceWithHook, injectArg } from "./widgetFactory.types";

/**
 * @deprecated use widgetBuilder instead
 */
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

        // Create the component using the factory function and pass it the hooks and props
        const Component = componentFactory(injectArg(config, useProps));

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

function createBuilder<
  WidgetInputProps extends object,
  WidgetOutputProps extends object,
>(passProps: (input: WidgetInputProps) => WidgetOutputProps) {
  return (
    creator: (
      useProps: () => WidgetInputProps,
      getProps: () => WidgetInputProps,
      PropsContext: Context<Maybe<WidgetInputProps>>,
    ) => ComponentType<WidgetOutputProps>,
  ) => {
    const ctx = createContext<Maybe<WidgetInputProps>>(maybe.ofAbsent());
    const useProps = () =>
      maybe.getOrThrow(
        useContext(ctx),
        "Attempted to use hook outside of the main widget component",
      );
    let latestProps: WidgetInputProps;
    // todo in the future we could just make props a signal
    const Component = creator(useProps, () => latestProps, ctx);
    return (props: WidgetInputProps) => {
      latestProps = props;
      return (
        <ctx.Provider value={maybe.of(props)}>
          <Component {...passProps(props)} />
        </ctx.Provider>
      );
    };
  };
}

export const widgetBuilder = {
  takeProps: <WidgetInputProps extends object>() => {
    return {
      noPassProps: () => {
        return {
          build: createBuilder<WidgetInputProps, {}>(() => ({})),
        };
      },
      passProps: <WidgetOutputProps extends object>(
        passProps: (input: WidgetInputProps) => WidgetOutputProps,
      ) => {
        return {
          build: createBuilder(passProps),
        };
      },
    };
  },
};
