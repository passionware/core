export function wrapIgnoreAbortError<R>(func: () => R) {
  try {
    return func();
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      // abort error expected, ignore
    } else {
      throw e;
    }
  }
}
