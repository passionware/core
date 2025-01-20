type MapKeys<T, M extends Partial<Record<keyof T, string>>> = {
  [K in keyof T as K extends keyof M ? M[K] & string : K]: T[K];
};

export function mapKeys<T, M extends Partial<Record<keyof T, string>>>(
  obj: T,
  keyMap: M,
): MapKeys<T, M> {
  const result = {} as MapKeys<T, M>;

  for (const key in obj) {
    const newKey = keyMap[key as keyof M] || key;
    (result as any)[newKey] = obj[key];
  }

  return result;
}
