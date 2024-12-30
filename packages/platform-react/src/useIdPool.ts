import { KeysAsDotNotation } from "deep-utility-types/src/util-types/keys-as-dot-notation";
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

type SpecToPool<T> = {
  [K in T extends string ? T : KeysAsDotNotation<T>]: string;
};

type SpecToPaths<T> = [T] extends [string] ? T : KeysAsDotNotation<T>;

declare const specToPool: SpecToPool<"amma" | "bemma">;

export function useDynamicIdPool<T>(): SpecToPool<T> {
  const base = useId();

  const proxy = new Proxy(
    {},
    {
      get(_: any, prop: SpecToPaths<T>) {
        return `${base}-${prop}`;
      },
    },
  );

  return useMemo(() => proxy, [base]);
}
