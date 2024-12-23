import { maybe, Maybe } from "@passionware/monads";
import { Decorator } from "@storybook/react";
import { createContext, PropsWithChildren, useContext } from "react";

export function createArgsDecorator<Props>() {
  const argsContext = createContext<Maybe<Props>>(maybe.ofAbsent());
  let latestArgs: Maybe<Props> = maybe.ofAbsent();
  return {
    argsDecorator: ((Story, ctx) => {
      latestArgs = ctx.args as Props;
      return (
        <argsContext.Provider value={latestArgs}>
          <Story />
        </argsContext.Provider>
      );
    }) satisfies Decorator,
    getLatestArgs: () =>
      maybe.getOrThrow(latestArgs, "getLatestArgs must be used inside a story"),
    useArgs: () =>
      maybe.getOrThrow(
        useContext(argsContext),
        "useArgs must be used inside a story",
      ),
    OverrideArgs: ({
      children,
      ...args
    }: PropsWithChildren<Partial<Props>>) => {
      const parentArgs = useContext(argsContext);
      const parentWithOverride = { ...parentArgs, ...args } as Props;
      return (
        <argsContext.Provider value={parentWithOverride}>
          {children}
        </argsContext.Provider>
      );
    },
  };
}

export type ArgsDecorator<T> = ReturnType<typeof createArgsDecorator<T>>;

// Define MappedFields to infer the mapped types
type Mapper<Args> = Partial<Record<keyof Args, string>>;
type MappedFields<Args, Mapping extends Mapper<Args>> = {
  [K in keyof Args as Mapping[K] extends string ? Mapping[K] : K]: Args[K];
};

// Modified createArgsAccessor to work with createArgsDecorator's return type
export function createArgsAccessor<Args, Mapping extends Mapper<Args>>(
  argsDecorator: ArgsDecorator<Args>,
  mapping?: Mapping,
) {
  // Get the latest mapped args based on mapping
  const getLatestArgs = (): MappedFields<Args, Mapping> => {
    const latestArgs = argsDecorator.getLatestArgs();
    const mappedArgs = latestArgs;

    if (!mapping) {
      return latestArgs as MappedFields<Args, Mapping>;
    }

    for (const [mappedKey, originalKey] of Object.entries(mapping) as [
      keyof Mapping,
      keyof Args,
    ][]) {
      // @ts-expect-error -- TS doesn't understand that mappedKey is a key of Mapping
      mappedArgs[mappedKey] = latestArgs[originalKey];
    }
    return mappedArgs as MappedFields<Args, Mapping>;
  };

  // Hook to access mapped args within a component tree
  const useArgs = (): MappedFields<Args, Mapping> => {
    const contextArgs = argsDecorator.useArgs();
    const mappedArgs = contextArgs;

    if (!mapping) {
      return contextArgs as MappedFields<Args, Mapping>;
    }

    for (const [originalKey, mappedKey] of Object.entries(mapping) as [
      keyof Mapping,
      keyof Args,
    ][]) {
      mappedArgs[mappedKey as keyof typeof mappedArgs] =
        // @ts-expect-error -- TS doesn't understand that mappedKey is a key of Mapping
        contextArgs[originalKey];
    }
    return mappedArgs as MappedFields<Args, Mapping>;
  };

  return {
    getLatestArgs,
    useArgs,
  };
}

export type ArgsAccessor<Args> = {
  getLatestArgs: () => Args;
  useArgs: () => Args;
};
