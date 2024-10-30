export type Overwrite<T, U> = Omit<T, keyof U> & U;

export type MakeOptional<T, Fields extends keyof T> = {
  [P in keyof T as Exclude<P, Fields>]: T[P];
} & {
  [P in Fields]?: T[P];
};

/**
 * Creates a function that, when called, invokes each provided producer function
 * and collects their results into an array.
 *
 * @example
 * const [a, b, c] = aggregateProducers(
 *  () => 'a',
 *  () => 'b',
 *  () => 'c'
 *  )();
 *
 * @template TProducers - Tuple type capturing the array of producer functions.
 * @param producers - An array of producer functions, each taking no arguments.
 * @returns A function that returns an array of the results produced by the input functions.
 */
export function combineHooks<TProducers extends Array<() => any>>(
  ...producers: TProducers
): () => { [K in keyof TProducers]: ReturnType<TProducers[K]> } {
  return () =>
    producers.map((func) => func()) as {
      [K in keyof TProducers]: ReturnType<TProducers[K]>;
    };
}

export function filterObjectKeys<T extends object>(
  obj: T,
  predicate: (key: keyof T) => boolean,
): Partial<T> {
  return (Object.keys(obj) as Array<keyof T>)
    .filter(predicate)
    .reduce((result, key) => {
      // eslint-disable-next-line no-param-reassign
      result[key] = obj[key];
      return result;
    }, {} as Partial<T>);
}

export function filterObjectFields<T extends {}>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Explicitly casting `value` to `T[keyof T]`
    if (predicate(value as T[keyof T], key as keyof T)) {
      acc[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);
}
