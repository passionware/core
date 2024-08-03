import { maybe, Maybe } from "@passionware/monads";
import { useEffect, useLayoutEffect, useState } from "react";
import { Observable } from "rxjs";

export const useStreamEvent = <T>(
  stream: Observable<T> | undefined,
  callback: ((data: T) => void) | undefined,
) => {
  useEffect(() => {
    if (stream && callback) {
      const subscription = stream.subscribe(callback);
      return () => subscription.unsubscribe();
    }
    return () => undefined;
  }, [callback, stream]);
};

export const useStreamValue = <T>(stream: Observable<T>): Maybe<T> => {
  const [value, setValue] = useState<Maybe<T>>(maybe.ofAbsent());
  useLayoutEffect(() => {
    if (stream) {
      const subscription = stream.subscribe(setValue);
      return () => subscription.unsubscribe();
    }
    return () => undefined;
  }, [stream]);
  return value;
};
