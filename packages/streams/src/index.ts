import { useEffect } from 'react';
import { Observable } from 'rxjs';

export const useStreamEvent = <T>(
  stream: Observable<T> | undefined,
  callback: ((data: T) => void) | undefined
) => {
  useEffect(() => {
    if (stream && callback) {
      const subscription = stream.subscribe(callback);
      return () => subscription.unsubscribe();
    }
    return () => undefined;
  }, [callback, stream]);
};
