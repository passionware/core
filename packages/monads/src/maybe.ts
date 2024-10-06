import { truthy } from "./truthy";

export type Absent = null | undefined;
export type Maybe<T> = T | Absent;
export type Present<T> = Exclude<T, Absent>;

type MaybesObject = { [key: string]: Maybe<any> };
type ResultObject<T extends MaybesObject> = { [P in keyof T]: Present<T[P]> };

export const maybe = {
  of: <T>(value: Maybe<T>): Maybe<T> => value ?? undefined,
  ofAbsent: (): Absent => undefined,
  fromArray: <T extends any[]>(values: Maybe<T>): Maybe<T> =>
    maybe.isPresent(values) && values.length > 0 ? values : undefined,
  fromTruthy: <T>(value: T) => (truthy.isTruthy(value) ? value : undefined),
  isPresent: <T>(value: T): value is Present<T> =>
    value !== null && value !== undefined,
  assertPresent: <T>(value: Maybe<T>): asserts value is Present<T> => {
    if (value === null || value === undefined) {
      throw new Error("Value is absent");
    }
  },
  isAbsent: <T>(value: Maybe<T>): value is Absent => !maybe.isPresent(value),
  journey: <T>(value: Maybe<T>) => ({
    ifPresent: <U>(fn: (value: Present<T>) => U) => ({
      orElse: <V>(defaultValue: V | (() => V)) =>
        maybe.isPresent(value)
          ? fn(value)
          : typeof defaultValue === "function"
            ? (defaultValue as () => V)()
            : defaultValue,
    }),
  }),
  getOrElse: <T, U>(value: Maybe<T>, defaultValue: U): Present<T> | U =>
    maybe.isPresent(value) ? value : defaultValue,
  getOrMake: <T, U>(value: Maybe<T>, make: () => U): Present<T> | U =>
    maybe.isPresent(value) ? value : make(),
  getOrThrow: <T>(
    value: Maybe<T>,
    message = "Attempted to unwrap an absent value",
  ): Present<T> => {
    if (maybe.isPresent(value)) {
      return value;
    }
    throw new Error(message);
  },
  // Utilize the ternary operator for a more concise implementation
  map: <T, U>(
    value: T,
    fn: (value: Present<T>) => U,
  ): T extends Absent ? Maybe<U> : U =>
    // @ts-expect-error -- this is safe because we are checking for absence
    maybe.isPresent(value) ? fn(value) : undefined,
  call: <T, U>(value: Maybe<T>, fn: (value: Present<T>) => U): void =>
    void (maybe.isPresent(value) ? fn(value) : undefined),
  callOrFallback: <T, U>(
    value: Maybe<T>,
    fn: (value: Present<T>) => U,
    fallback: () => U,
  ): U => (maybe.isPresent(value) ? fn(value) : fallback()),
  mapOrElse: <T, U, V>(
    value: Maybe<T>,
    fn: (value: Present<T>) => U,
    defaultValue: V,
  ) => (maybe.isPresent(value) ? fn(value) : defaultValue),
  mapOrMake: <T, U, V>(
    value: Maybe<T>,
    fn: (value: Present<T>) => U,
    make: () => V,
  ) => (maybe.isPresent(value) ? fn(value) : make()),
  mapOrThrow: <T, U>(
    value: Maybe<T>,
    fn: (value: Present<T>) => U,
    message = "Attempted to unwrap an absent value",
  ): U => {
    if (maybe.isPresent(value)) {
      return fn(value);
    }
    throw new Error(message);
  },
  /**
   * Tries to map the value. If the value is absent or the mapping function returns an absent value,
   * the default value is returned.
   */
  flatMapOrElse: <T, U, V>(
    value: T,
    fn: (value: Present<T>) => Maybe<U>,
    defaultValue: V,
  ) => maybe.getOrElse(maybe.map(value, fn), defaultValue),
  /**
   * Tries to map the value. If the value is absent or the mapping function returns an absent value,
   * the default value is made.
   */
  flatMapOrMake: <T, U, V>(
    value: T,
    fn: (value: Present<T>) => Maybe<U>,
    make: () => V,
  ) => maybe.getOrElse(maybe.map(value, fn), make()),
  // Simplify filter by removing redundant checks
  filter: <T>(
    value: Maybe<T>,
    predicate: (value: Present<T>) => boolean,
  ): Maybe<T> =>
    maybe.isPresent(value) && predicate(value) ? value : undefined,
  filterOrElse: <T, U>(
    value: Maybe<T>,
    predicate: (value: Present<T>) => boolean,
    defaultValue: U,
  ) => (maybe.isPresent(value) && predicate(value) ? value : defaultValue),
  filterOrMake: <T, U>(
    value: Maybe<T>,
    predicate: (value: Present<T>) => boolean,
    make: () => U,
  ) => (maybe.isPresent(value) && predicate(value) ? value : make()),
  combine: <T extends MaybesObject>(maybes: T): Maybe<ResultObject<T>> => {
    const keys = Object.keys(maybes);
    const result: Partial<ResultObject<T>> = {};
    if (keys.length === 0) return undefined;
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const value = maybes[key];
      if (maybe.isAbsent(value)) {
        return undefined; // or undefined, based on your convention
      }
      // @ts-expect-error -- this is safe because we are builind the result object
      result[key] = value;
    }
    return result as ResultObject<T>;
  },
  /**
   * @experimental probably not that useful due to limited inference support
   * Returns the value if the condition is true, otherwise returns Absent.
   */
  takeIf: <T>(condition: boolean, value: T) =>
    condition ? value : maybe.ofAbsent(),
};
