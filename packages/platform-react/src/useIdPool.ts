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
