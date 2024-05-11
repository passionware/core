export type Falsy =
  | undefined
  | null
  | false
  | 0
  | ""
  | typeof NaN
  | void
  | never
  | 0n;
export type Truthy<T> = Exclude<T, Falsy>;

export const truthy = {
  takeIf: <T>(testValue: unknown, value: T) => (testValue ? value : undefined),
  map: <T, U>(testValue: T, fn: (value: Exclude<T, Falsy>) => U) =>
    truthy.isTruthy(testValue) ? fn(testValue) : undefined,
  isTruthy: <T>(value: T): value is Truthy<T> => !!value,
};
