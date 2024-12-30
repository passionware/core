type AppendArgument<F, Arg> = F extends (...args: infer Args) => infer R
  ? (...args: [...Args, Arg]) => R
  : never;

type IsHook<K> = K extends `use${Capitalize<string>}` ? true : false;

export type EnhanceWithHook<T, HookArg> = {
  [K in keyof T]: IsHook<K> extends true
    ? T[K] extends (...args: any[]) => any
      ? AppendArgument<T[K], HookArg>
      : T[K]
    : T[K];
};
export function injectArg<T, HookArg>(
  hooks: EnhanceWithHook<T, HookArg>,
  useArg: () => HookArg,
): T {
  const enhancedHooks = {} as T;
  for (const key in hooks) {
    const hook = hooks[key];
    if (
      typeof hook === "function" &&
      key.startsWith("use") &&
      key[3] === key[3].toUpperCase()
    ) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      enhancedHooks[key] = (...args: unknown[]) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const arg = useArg();
        return hook(...args, arg);
      };
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      enhancedHooks[key] = hook;
    }
  }
  return enhancedHooks;
}
//
// // Usage Example
// interface OriginalHooks {
//   useData: (url: string) => { data: string; loading: boolean };
//   useEffect: () => void;
//   useValue: () => number;
//   useLatestFeatures: boolean;
//   nonHookField: string;
//   user: () => { name: string }; // Not a hook, does not get enhanced
//   userData: () => { data: any }; // Not starting with 'use' followed by an uppercase letter
// }

// type EnhancedHooks = EnhanceWithHook<OriginalHooks, { userId: number }>;
//
// const enhancedHooks: EnhancedHooks = {
//   nonHookField: "nonHookField",
//   useData: (url: string, { userId }) => ({ data: url + userId, loading: true }),
//   user: () => ({ name: "name" }),
//   userData: () => ({ data: "data" }),
//   useEffect: (props) => {
//     props.userId++;
//   },
//   useValue: (a) => 1,
//   useLatestFeatures: true,
// };
