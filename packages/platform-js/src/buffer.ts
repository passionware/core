type Callback<T> = (args: T[]) => void;

/**
 * Buffer function calls and call the callback with the buffered arguments after a certain time.
 */
export function buffer<T>(callback: Callback<T>, wait: number) {
  let buffer: T[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function flush() {
    if (buffer.length > 0) {
      callback(buffer);
      buffer = [];
      timeoutId = null;
    }
  }

  return function (argument: T) {
    buffer.push(argument);
    if (!timeoutId) {
      timeoutId = setTimeout(flush, wait);
    }
  };
}
