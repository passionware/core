export function ensureError<T>(value: T) {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  if (
    typeof value === 'object' &&
    value &&
    'message' in value &&
    typeof value.message === 'string'
  ) {
    return new Error(value.message);
  }
  if (
    typeof value === 'object' &&
    value &&
    'error' in value &&
    value.error instanceof Error
  ) {
    return value.error;
  }
  return new Error(`An error occurred: ${JSON.stringify(value)}`);
}
