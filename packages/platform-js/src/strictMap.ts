import { maybe } from "@passionware/monads";

export function createStrictMap<K, V>(map: Map<K, V>, errorMessage: string) {
  return {
    get(key: K) {
      const value = map.get(key);
      if (maybe.isAbsent(value)) {
        throw new Error(errorMessage.replaceAll("{key}", String(key)));
      }
      return value;
    },
    set: map.set.bind(map),
    has: map.has.bind(map),
    forEach: map.forEach.bind(map),
    keys: map.keys.bind(map),
    values: map.values.bind(map),
    entries: map.entries.bind(map),
    delete: map.delete.bind(map),
    clear: map.clear.bind(map),
    size: map.size,
  };
}
