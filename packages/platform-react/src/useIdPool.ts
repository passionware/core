import { useId, useMemo } from "react";

export function useIdPool<KeySpec extends object>(fieldsShape: KeySpec) {
  const base = useId();

  return useMemo(() => {
    const keys = Object.keys(fieldsShape) as Array<keyof KeySpec & string>;
    return keys.reduce(
      (acc, key) => {
        acc[key] = `${base}-${key}` as const;
        return acc;
      },
      {} as { [K in keyof KeySpec]: string },
    );
  }, [base]);
}

type ExtractKeys<T> = T extends string[]
  ? T[number]
  : T extends object
    ? keyof T & string
    : T & string;

export function useDynamicIdPool<T>(): Record<ExtractKeys<T>, string> {
  const base = useId();

  const proxy = new Proxy(
    {},
    {
      get(target: any, prop: ExtractKeys<T>) {
        return `${base}-${prop}`;
      },
    },
  );

  return useMemo(() => proxy, [base]);
}
