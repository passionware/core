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
    ifPresent: <U>(fn: (value: T) => U) => ({
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
  map: <T, U>(value: Maybe<T>, fn: (value: T) => U): Maybe<U> =>
    maybe.isPresent(value) ? fn(value) : undefined,
  call: <T, U>(value: Maybe<T>, fn: (value: T) => U): void =>
    void (maybe.isPresent(value) ? fn(value) : undefined),
  mapOrElse: <T, U, V>(
    value: Maybe<T>,
    fn: (value: T) => U,
    defaultValue: V,
  ) => (maybe.isPresent(value) ? fn(value) : defaultValue),
  mapOrMake: <T, U, V>(value: Maybe<T>, fn: (value: T) => U, make: () => V) =>
    maybe.isPresent(value) ? fn(value) : make(),
  // Simplify filter by removing redundant checks
  filter: <T>(value: Maybe<T>, predicate: (value: T) => boolean): Maybe<T> =>
    maybe.isPresent(value) && predicate(value) ? value : undefined,
  filterOrElse: <T, U>(
    value: Maybe<T>,
    predicate: (value: T) => boolean,
    defaultValue: U,
  ) => (maybe.isPresent(value) && predicate(value) ? value : defaultValue),
  filterOrMake: <T, U>(
    value: Maybe<T>,
    predicate: (value: T) => boolean,
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
};
