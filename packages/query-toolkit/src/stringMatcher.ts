export function matchString(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function createMatcher<T>(
  query: string,
  valueLookup: (item: T) => string,
) {
  return (item: T) => matchString(valueLookup(item), query);
}
