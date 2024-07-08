import { rd, RemoteData } from "@passionware/monads";
import { useEffect, useState, type DependencyList } from "react";

export type TestQuery<T> = {
  remoteData: RemoteData<T>;
  delay: number;
};

function getInitialState<T>(query: TestQuery<T>) {
  if (rd.isIdle(query.remoteData)) {
    return rd.ofIdle();
  }
  if (rd.isPending(query.remoteData)) {
    return rd.ofPending();
  }
  // error or data - let's honour the delay 0 or more
  if (query.delay === 0) {
    return query.remoteData;
  }
  return rd.ofPending();
}

export const testQuery = {
  of: <T>(remoteData: RemoteData<T>, delay: number = 0): TestQuery<T> => ({
    remoteData,
    delay,
  }),
  useData: <T>(query: TestQuery<T>) => {
    const [state, setState] = useState<RemoteData<T>>(() =>
      getInitialState(query),
    );
    const queryStatus = query.remoteData.status;
    const maybeData = rd.tryGet(query.remoteData);
    const maybeError = rd.tryGetError(query.remoteData);
    useEffect(() => {
      setState(getInitialState(query));
      if (query.delay > 0) {
        const timer = setTimeout(() => {
          setState(query.remoteData);
        }, query.delay);
        return () => clearTimeout(timer);
      }
    }, [queryStatus, maybeData, maybeError, query.delay]);

    return state;
  },
  map: <T, V, D extends DependencyList>(
    query: TestQuery<T>,
    producer: (data: T, ...deps: D) => V,
    deps: D,
  ) =>
    testQuery.useData(
      testQuery.of(
        rd.useMemo(
          query.remoteData,
          (remoteData, ...deps) =>
            rd.map(remoteData, (data) => producer(data, ...deps)),
          deps,
        ),
        query.delay,
      ),
    ),
};
